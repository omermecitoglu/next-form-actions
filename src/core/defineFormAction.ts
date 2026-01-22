import { bundleErrors } from "./bundleErrors";
import { solveKnownIssues } from "./solveKnownIssues";
import type { ZodObject, ZodType } from "zod";

/**
 * Describes the definition of a type-safe server action for forms.
 */
type ActionDefinition<Shape extends Record<string, ZodType>, SchemaI, SchemaO, Args extends unknown[]> = {
  /**
   * An array of middleware functions to execute before the action. (Optional)
   */
  middlewares?: (() => void | Promise<void>)[],
  /**
   * The Zod schema used to validate form data.
   */
  schema: ZodType<SchemaO, SchemaI> & ZodObject<Shape>,
  /**
   * The function to execute if validation succeeds. Receives parsed data and returns a function for additional arguments.
   */
  action: (input: SchemaO) => ((...args: [...Args]) => Promise<Partial<Record<string, string>>>),
};

type FormAction<Args extends unknown[]> = (
  ...allParams: [...Args, initialState: unknown, formData: FormData]
) => Promise<Record<string, string>>;

/**
 * Defines a type-safe React server action for forms, validating form data with Zod and handling errors internally.
 *
 * @param definition - The form action definition object.
 * @param definition.name - The unique name of the action.
 * @param definition.middleware - An array of middleware functions to execute before the action. (Optional)
 * @param definition.schema - The Zod schema used to validate form data.
 * @param definition.action - The function to execute if validation succeeds.
 * @returns An object containing the server action handler keyed by the action name.
 */
export function defineFormAction<
  Shape extends Record<string, ZodType>,
  SchemaI,
  SchemaO,
  Args extends unknown[],
>(definition: ActionDefinition<Shape, SchemaI, SchemaO, Args>): FormAction<Args> {
  async function handler(...allParams: [...Args, initialState: unknown, formData: FormData]) {
    if (definition.middlewares) {
      await Promise.all(definition.middlewares.map(middleware => middleware()));
    }

    const formData = allParams[allParams.length - 1] as FormData;
    const customArgs = allParams.slice(0, allParams.length - 2) as Args;

    const validation = solveKnownIssues(definition.schema.strip(), Object.fromEntries(formData.entries()));
    if (!validation.success) {
      return bundleErrors(validation.error.issues);
    }
    return await definition.action(validation.data as SchemaO)(...customArgs);
  }
  return handler as FormAction<Args>;
}
