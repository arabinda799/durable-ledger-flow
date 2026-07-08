export class ApiResponse<T = void> {
  success?: boolean;
  message: string;
  data?: T | null;
}
