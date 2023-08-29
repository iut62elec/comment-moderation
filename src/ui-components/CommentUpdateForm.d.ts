/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SwitchFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
import { EscapeHatchProps } from "@aws-amplify/ui-react/internal";
import { Comment } from "../models";
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type CommentUpdateFormInputValues = {
    comment?: string;
    publish?: boolean;
};
export declare type CommentUpdateFormValidationValues = {
    comment?: ValidationFunction<string>;
    publish?: ValidationFunction<boolean>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type CommentUpdateFormOverridesProps = {
    CommentUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    comment?: PrimitiveOverrideProps<TextFieldProps>;
    publish?: PrimitiveOverrideProps<SwitchFieldProps>;
} & EscapeHatchProps;
export declare type CommentUpdateFormProps = React.PropsWithChildren<{
    overrides?: CommentUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    comment?: Comment;
    onSubmit?: (fields: CommentUpdateFormInputValues) => CommentUpdateFormInputValues;
    onSuccess?: (fields: CommentUpdateFormInputValues) => void;
    onError?: (fields: CommentUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: CommentUpdateFormInputValues) => CommentUpdateFormInputValues;
    onValidate?: CommentUpdateFormValidationValues;
} & React.CSSProperties>;
export default function CommentUpdateForm(props: CommentUpdateFormProps): React.ReactElement;
