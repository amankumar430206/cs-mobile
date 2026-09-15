import { createQueryClient } from "@castadi/shared";
import { toastAdapter } from "./toast";

export const queryClient = createQueryClient(toastAdapter);
