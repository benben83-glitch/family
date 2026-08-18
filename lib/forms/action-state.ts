export type FormActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const initialFormState: FormActionState = { status: "idle" };
