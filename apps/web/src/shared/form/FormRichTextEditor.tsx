'use client';

import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
  Tooltip,
} from '@mui/material';
import TextAlign from '@tiptap/extension-text-align';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  type LucideIcon,
  Pilcrow,
  RemoveFormatting,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Controller, type FieldValues, type RefCallBack, useFormContext } from 'react-hook-form';

import { portalFontSize } from '@/core/theme';
import type { BaseFormFieldProps } from '@/types';

type RichTextBlock = 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3';
type HeadingLevel = 1 | 2 | 3;
type TextAlignValue = 'left' | 'center' | 'right' | 'justify';

interface RichTextToolbarState {
  block: RichTextBlock;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bulletList: boolean;
  orderedList: boolean;
  textAlign: TextAlignValue | null;
}

export interface FormRichTextEditorProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  disabled?: boolean;
  required?: boolean;
  minHeight?: number;
  sx?: SxProps<Theme>;
  focusRequestKey?: number;
  toolbarEndAdornment?: ReactNode;
}

interface ToolbarIconButtonProps {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const headingLevels: HeadingLevel[] = [1, 2, 3];
const richTextExtensions = [
  StarterKit,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),
];

const getCurrentBlock = (editor: Editor | null): RichTextBlock => {
  const level = headingLevels.find((headingLevel) =>
    editor?.isActive('heading', { level: headingLevel }),
  );

  return level ? `heading-${level}` : 'paragraph';
};

const getToolbarState = (editor: Editor | null): RichTextToolbarState => ({
  block: getCurrentBlock(editor),
  bold: !!editor?.isActive('bold'),
  italic: !!editor?.isActive('italic'),
  underline: !!editor?.isActive('underline'),
  bulletList: !!editor?.isActive('bulletList'),
  orderedList: !!editor?.isActive('orderedList'),
  textAlign: editor?.isActive({ textAlign: 'center' })
    ? 'center'
    : editor?.isActive({ textAlign: 'right' })
      ? 'right'
      : editor?.isActive({ textAlign: 'justify' })
        ? 'justify'
        : editor?.isActive({ textAlign: 'left' })
          ? 'left'
          : null,
});

const getEditorValue = (editor: Editor): string => (editor.isEmpty ? '' : editor.getHTML());

const isSameToolbarState = (left: RichTextToolbarState, right: RichTextToolbarState): boolean =>
  left.block === right.block &&
  left.bold === right.bold &&
  left.italic === right.italic &&
  left.underline === right.underline &&
  left.bulletList === right.bulletList &&
  left.orderedList === right.orderedList &&
  left.textAlign === right.textAlign;

const isHeadingBlock = (value: RichTextBlock): value is `heading-${HeadingLevel}` =>
  value.startsWith('heading-');

const getHeadingLevel = (value: `heading-${HeadingLevel}`): HeadingLevel =>
  Number(value.replace('heading-', '')) as HeadingLevel;

const ToolbarIconButton = ({
  label,
  icon: Icon,
  active = false,
  disabled = false,
  onClick,
}: ToolbarIconButtonProps) => (
  <Tooltip title={label}>
    <span>
      <IconButton
        type="button"
        size="small"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1,
          color: active ? 'primary.dark' : 'text.secondary',
          bgcolor: active ? 'action.selected' : 'transparent',
          '&:hover': {
            bgcolor: active ? 'action.selected' : 'action.hover',
          },
        }}
      >
        <Icon size={16} />
      </IconButton>
    </span>
  </Tooltip>
);

interface RichTextEditorFieldProps {
  name: string;
  value: unknown;
  label?: ReactNode;
  helperText?: ReactNode;
  errorMessage?: ReactNode;
  disabled: boolean;
  required: boolean;
  minHeight: number;
  sx?: SxProps<Theme>;
  focusRequestKey?: number;
  toolbarEndAdornment?: ReactNode;
  isDirty: boolean;
  inputRef: RefCallBack;
  onBlur: () => void;
  onChange: (value: string) => void;
}

const RichTextEditorField = ({
  name,
  value: rawValue,
  label,
  helperText,
  errorMessage,
  disabled,
  required,
  minHeight,
  sx,
  focusRequestKey,
  toolbarEndAdornment,
  isDirty,
  inputRef,
  onBlur,
  onChange,
}: RichTextEditorFieldProps) => {
  const t = useTranslations('forms.rich_text');
  const value = typeof rawValue === 'string' ? rawValue : '';
  const isSyncingExternalValueRef = useRef(false);
  const lastSyncedExternalValueRef = useRef({ name, value });
  const [toolbarState, setToolbarState] = useState<RichTextToolbarState>(() =>
    getToolbarState(null),
  );
  const editor = useEditor(
    {
      extensions: richTextExtensions,
      content: value,
      editable: !disabled,
      immediatelyRender: false,
      onBlur,
      onUpdate: ({ editor: currentEditor }) => {
        if (isSyncingExternalValueRef.current) {
          return;
        }

        onChange(getEditorValue(currentEditor));
      },
    },
    [disabled],
  );

  const syncToolbarState = useCallback(() => {
    const nextState = getToolbarState(editor);

    setToolbarState((currentState) =>
      isSameToolbarState(currentState, nextState) ? currentState : nextState,
    );
  }, [editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || disabled || !focusRequestKey) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      editor.commands.focus('end');
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [disabled, editor, focusRequestKey]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    queueMicrotask(syncToolbarState);
    editor.on('selectionUpdate', syncToolbarState);
    editor.on('transaction', syncToolbarState);

    return () => {
      editor.off('selectionUpdate', syncToolbarState);
      editor.off('transaction', syncToolbarState);
    };
  }, [editor, syncToolbarState]);

  useLayoutEffect(() => {
    if (!editor) {
      return;
    }

    const editorValue = getEditorValue(editor);

    if (editorValue === value) {
      lastSyncedExternalValueRef.current = { name, value };

      return;
    }

    const lastSyncedExternalValue = lastSyncedExternalValueRef.current;
    const isSameField = lastSyncedExternalValue.name === name;
    const hasFocusedDirtyValue = isSameField && isDirty && editor.isFocused;

    if (hasFocusedDirtyValue) {
      return;
    }

    isSyncingExternalValueRef.current = true;

    try {
      editor.commands.setContent(value, { emitUpdate: false });
    } finally {
      isSyncingExternalValueRef.current = false;
    }

    lastSyncedExternalValueRef.current = { name, value };
    syncToolbarState();
  }, [editor, isDirty, name, syncToolbarState, value]);

  const applyBlock = (event: SelectChangeEvent<RichTextBlock>) => {
    const nextBlock = event.target.value;
    const command = editor?.chain().focus();

    if (!command) {
      return;
    }

    if (nextBlock === 'paragraph') {
      command.setParagraph().run();

      return;
    }

    if (isHeadingBlock(nextBlock)) {
      command.toggleHeading({ level: getHeadingLevel(nextBlock) }).run();
    }
  };

  const applyTextAlign = (textAlign: TextAlignValue) => {
    editor?.chain().focus().setTextAlign(textAlign).run();
  };

  const toolbarDisabled = disabled || !editor;
  const hasError = Boolean(errorMessage);

  return (
    <FormControl fullWidth required={required} disabled={disabled} error={hasError} sx={sx}>
      {label ? (
        <FormLabel
          sx={{
            mb: 0.75,
            fontSize: portalFontSize(13),
            fontWeight: 500,
            color: hasError ? 'error.main' : 'text.secondary',
          }}
        >
          {label}
        </FormLabel>
      ) : null}

      <Box
        sx={{
          overflow: 'hidden',
          border: '1px solid',
          borderColor: hasError ? 'error.main' : 'divider',
          borderRadius: 1,
          bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
          transition: 'border-color 120ms ease',
          '&:focus-within': {
            borderColor: hasError ? 'error.main' : 'primary.dark',
          },
        }}
      >
        <Box
          role="toolbar"
          aria-label={t('toolbar')}
          sx={{
            gap: 0.5,
            p: 0.75,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Select<RichTextBlock>
            size="small"
            value={toolbarState.block}
            disabled={toolbarDisabled}
            onChange={applyBlock}
            displayEmpty
            renderValue={(selected) => t(`blocks.${selected}`)}
            sx={{
              width: 128,
              height: 30,
              fontSize: portalFontSize(12),
              '& .MuiSelect-select': {
                py: 0.5,
              },
            }}
          >
            <MenuItem value="paragraph">
              <Pilcrow size={15} />
              <Box component="span" sx={{ ml: 1 }}>
                {t('blocks.paragraph')}
              </Box>
            </MenuItem>
            <MenuItem value="heading-1">
              <Heading1 size={15} />
              <Box component="span" sx={{ ml: 1 }}>
                {t('blocks.heading-1')}
              </Box>
            </MenuItem>
            <MenuItem value="heading-2">
              <Heading2 size={15} />
              <Box component="span" sx={{ ml: 1 }}>
                {t('blocks.heading-2')}
              </Box>
            </MenuItem>
            <MenuItem value="heading-3">
              <Heading3 size={15} />
              <Box component="span" sx={{ ml: 1 }}>
                {t('blocks.heading-3')}
              </Box>
            </MenuItem>
          </Select>

          <ToolbarIconButton
            label={t('bold')}
            icon={Bold}
            active={toolbarState.bold}
            disabled={toolbarDisabled}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarIconButton
            label={t('italic')}
            icon={Italic}
            active={toolbarState.italic}
            disabled={toolbarDisabled}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarIconButton
            label={t('underline')}
            icon={UnderlineIcon}
            active={toolbarState.underline}
            disabled={toolbarDisabled}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <ToolbarIconButton
            label={t('bullet_list')}
            icon={List}
            active={toolbarState.bulletList}
            disabled={toolbarDisabled}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarIconButton
            label={t('ordered_list')}
            icon={ListOrdered}
            active={toolbarState.orderedList}
            disabled={toolbarDisabled}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarIconButton
            label={t('align_left')}
            icon={AlignLeft}
            active={toolbarState.textAlign === 'left'}
            disabled={toolbarDisabled}
            onClick={() => applyTextAlign('left')}
          />
          <ToolbarIconButton
            label={t('align_center')}
            icon={AlignCenter}
            active={toolbarState.textAlign === 'center'}
            disabled={toolbarDisabled}
            onClick={() => applyTextAlign('center')}
          />
          <ToolbarIconButton
            label={t('align_right')}
            icon={AlignRight}
            active={toolbarState.textAlign === 'right'}
            disabled={toolbarDisabled}
            onClick={() => applyTextAlign('right')}
          />
          <ToolbarIconButton
            label={t('align_justify')}
            icon={AlignJustify}
            active={toolbarState.textAlign === 'justify'}
            disabled={toolbarDisabled}
            onClick={() => applyTextAlign('justify')}
          />
          <ToolbarIconButton
            label={t('clear_formatting')}
            icon={RemoveFormatting}
            disabled={toolbarDisabled}
            onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          />

          {toolbarEndAdornment ? (
            <Box
              sx={{
                ml: 'auto',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {toolbarEndAdornment}
            </Box>
          ) : null}
        </Box>

        <Box
          onClick={() => editor?.chain().focus().run()}
          sx={{
            cursor: disabled ? 'default' : 'text',
            '& .tiptap': {
              minHeight,
              px: 1.5,
              py: 1.25,
              outline: 'none',
              color: disabled ? 'text.disabled' : 'text.primary',
              fontSize: portalFontSize(14),
              lineHeight: 1.65,
            },
            '& .tiptap p': {
              my: 0.75,
            },
            '& .tiptap h1, & .tiptap h2, & .tiptap h3': {
              mt: 1,
              mb: 0.75,
              lineHeight: 1.25,
            },
            '& .tiptap h1': {
              fontSize: portalFontSize(24),
            },
            '& .tiptap h2': {
              fontSize: portalFontSize(20),
            },
            '& .tiptap h3': {
              fontSize: portalFontSize(17),
            },
            '& .tiptap ul, & .tiptap ol': {
              my: 0.75,
              pl: 3,
            },
            '& .tiptap > :first-child': {
              mt: 0,
            },
            '& .tiptap > :last-child': {
              mb: 0,
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>

      {(errorMessage || helperText) && (
        <FormHelperText sx={{ mr: 0, ml: 0.5 }}>{errorMessage ?? helperText}</FormHelperText>
      )}

      <input ref={inputRef} type="hidden" name={name} value={value} readOnly />
    </FormControl>
  );
};

export const FormRichTextEditor = <T extends FieldValues>({
  name,
  rules,
  label,
  helperText,
  disabled = false,
  required = false,
  minHeight = 180,
  sx,
  focusRequestKey,
  toolbarEndAdornment,
}: FormRichTextEditorProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <RichTextEditorField
          name={field.name}
          value={field.value}
          label={label}
          helperText={helperText}
          errorMessage={fieldState.error?.message}
          disabled={disabled}
          required={required}
          minHeight={minHeight}
          sx={sx}
          focusRequestKey={focusRequestKey}
          toolbarEndAdornment={toolbarEndAdornment}
          isDirty={fieldState.isDirty}
          inputRef={field.ref}
          onBlur={field.onBlur}
          onChange={field.onChange}
        />
      )}
    />
  );
};
