import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePdf, CreatePdfOptions, HbsDocument } from './pdf.type';
import { Type } from 'class-transformer';

/**
 * CreatePdfPage Validator
 */
class CreatePdfPageDTO implements HbsDocument {
  @IsString()
  hbsTemplate: string;

  @IsOptional()
  @IsObject()
  data?: { [key: string]: any };
}

/**
 * CreatePdfOptions Validator
 */
class CreatePdfOptionsDTO implements CreatePdfOptions {
  @IsOptional()
  @IsNumber()
  paginationStartPage?: number;

  @IsOptional()
  @IsNumber()
  paginationStartNumber?: number;
}

/**
 * CreatePdf Validator
 */
export class CreatePdfDTO implements CreatePdf {
  // 1) pages
  @ApiProperty({
    example: [
      {
        hbsTemplate: 'template 1 : {{x}}',
        data: { x: 'welcome' },
      },
      {
        hbsTemplate: 'template 2 {{x}}',
        data: { x: 42 },
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePdfPageDTO)
  documents: CreatePdfPageDTO[];

  // 2) pagination
  @ApiProperty({
    example: {
      paginationStartPage: 2,
      paginationStartNumber: 1,
    },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePdfOptionsDTO)
  options?: CreatePdfOptionsDTO;
}
