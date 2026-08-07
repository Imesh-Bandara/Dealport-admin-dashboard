import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Shared by /products/top and /products/best-selling — both take an
 *  optional, bounded `limit`. Kept out of QueryProductDto since those two
 *  endpoints don't take the rest of the list/filter params. */
export class LimitQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
