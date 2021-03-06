import { AbstractValueObject } from '@/Domain';
import { instanceToPlain, plainToInstance, Transform, TransformationType } from 'class-transformer';
import { INTERNAL_ERROR } from './AppError';
import { ERR, ErrorResult, OK, Result, SuccessResult } from './Result';

export const INVALID_PLAIN_OBJECT_ERROR_TYPE = 'core.dto.invalid_plain_object';

export type DtoBaseConstructor<T extends DtoBase> = {
  new (props?: Partial<T>): T;
};

export const TT = TransformationType;
export const isPT = (type: TransformationType) => type === TransformationType.CLASS_TO_PLAIN;

export function ValueObjectTransformer<T extends AbstractValueObject<any>>(t: { c: (value: any) => Result<T> }) {
  return Transform(({ value, type }) => (value ? (isPT(type) ? value.toJSON() : (t as any).c(value)) : undefined));
}

export function DtoTransformer<T extends DtoBase>(t: { new (): T }) {
  return Transform(({ value, type }) => (value ? (isPT(type) ? value.toJSON() : (t as any).fromPlain(value)) : undefined));
}

export function BigIntTransformer() {
  return Transform(({ value, type }) => (isPT(type) ? value.toString() : BigInt(value)));
}

export abstract class DtoBase {
  public static cs<T extends DtoBase>(this: DtoBaseConstructor<T>, props: Partial<T>): T {
    const i = new this();
    Object.assign(i, props);
    return i;
  }
  public static fromPlain<T extends DtoBase>(this: DtoBaseConstructor<T>, plain: any): Result<T> {
    try {
      const i: any = plainToInstance(this, plain);
      return (this as any).processFromPlain(i);
    } catch (e) {
      return ERR(INTERNAL_ERROR(e));
    }
  }

  /**
   * @param i
   * @returns Result of tranformation from plain
   */
  protected static processFromPlain<T extends DtoBase>(this: DtoBaseConstructor<T>, i: any): Result<any> {
    const errors = [];

    for (const p in i) {
      if (i[p] instanceof ErrorResult) {
        errors.push(i[p].e);
      } else {
        if (i[p] instanceof SuccessResult) {
          i[p] = i[p].v;
        }
      }
    }
    if (errors.length > 0) {
      return ERR(INVALID_PLAIN_OBJECT_ERROR_TYPE, 400, {
        className: this.name,
        errors,
      });
    }
    return OK(i);
  }

  public toJSON() {
    return instanceToPlain(this);
  }
}
