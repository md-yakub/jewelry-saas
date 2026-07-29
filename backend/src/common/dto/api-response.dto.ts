import { ApiProperty } from "@nestjs/swagger";

export class ApiResponseDto<TData> {
  @ApiProperty({ description: "Response payload for the request." })
  data!: TData;

  @ApiProperty({
    description: "ISO timestamp when the response envelope was generated.",
    example: "2026-07-19T10:00:00.000Z",
  })
  timestamp!: string;
}

export class PaginationMetaDto {
  @ApiProperty({ description: "Current page number.", example: 1 })
  page!: number;

  @ApiProperty({
    description: "Maximum records returned per page.",
    example: 20,
  })
  limit!: number;

  @ApiProperty({ description: "Total matching records.", example: 42 })
  total!: number;

  @ApiProperty({ description: "Total number of pages.", example: 3 })
  totalPages!: number;
}

export class PaginatedResponseDto<TItem> {
  @ApiProperty({ description: "Records for the current page." })
  items!: TItem[];

  @ApiProperty({ description: "Pagination metadata.", type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}

export class ApiErrorResponseDto {
  @ApiProperty({
    description: "HTTP status code.",
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: "Human-readable error message or validation messages.",
    oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
    example: [
      "email must be an email",
      "password must be longer than or equal to 8 characters",
    ],
  })
  message!: string | string[];

  @ApiProperty({
    description: "Short error label.",
    example: "Bad Request",
  })
  error!: string;

  @ApiProperty({
    description: "Request path that produced the error.",
    example: "/auth/login",
  })
  path!: string;

  @ApiProperty({
    description: "ISO timestamp when the error was generated.",
    example: "2026-07-19T10:00:00.000Z",
  })
  timestamp!: string;
}
