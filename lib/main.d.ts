declare module "xema" {
    interface ValidationResult{
        error? : string
    }
    
    interface SubsetCheckIsSubset{
        isSubset : true,
    }
    
    interface SubsetCheckIsNotSubset{
        isSubset : false,
        reason: string
    }
    
    type SubsetCheckResult = SubsetCheckIsSubset | SubsetCheckIsNotSubset

    interface Schema {
       checkSubsetOf(schema: Schema): SubsetCheckResult
    }
    
    interface TypedSchema<T> extends Schema {
        validate(value: T): ValidationResult
        checkSubsetOf(schema: TypedSchema<T>): SubsetCheckResult
    }
    
    interface OptionalSchema {
        optional(): this
    }
    
    interface DataGeneratorOptions{
        maxAmount: number
    }
    
    interface SequentialDataGenerator<T> {
        generateSequentialData(options?: DataGeneratorOptions): Iterator<T>
    }
    
    interface RandomDataGenerator<T> {
        generateRandomData(options?: DataGeneratorOptions): Iterator<T>
    }

    interface BasicTypeSchema<T> extends TypedSchema<T>, OptionalSchema, SequentialDataGenerator<T>, RandomDataGenerator<T>{
    }
    
     export interface StringSchema extends BasicTypeSchema<string>{
         startsWith(text: string): this;
         endsWith(text: string): this;
         contains(text: string): this;
         oneOf(...text: string[]): this;
    }
    
    export interface BooleanSchema extends BasicTypeSchema<boolean>{}
    
    export interface NumberSchema extends BasicTypeSchema<number>{
        max(maximum: number): this
        min(minimum: number): this
        integer(): this
        divisibleBy(num: number): this
    }

    interface ComponentSchema<T> extends TypedSchema<T>, OptionalSchema, RandomDataGenerator<T>{
    }

    interface ArraySchema<T> extends ComponentSchema<T[]> {
      maxLength(maximum: number): this
      minLength(minimum: number): this
      of<Y>(recordSchema: TypedSchema<Y>): ArraySchema<Y>
    }


    interface ObjectSchema<T extends object> extends ComponentSchema<T> {
      keys<Y extends {[x:string]:TypedSchema<X>}>(recordSchema: Y): ObjectSchema<{[P in keyof Y]: any}>
    }
    
    export const string: StringSchema;
    export const number: NumberSchema;
    export const boolean: BooleanSchema;
    export const array: ArraySchema<any>;
    export const object: ObjectSchema<{}>;
}

