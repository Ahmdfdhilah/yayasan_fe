import { forwardRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '@workspace/ui/lib/utils';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  variant?: 'default' | 'minimal' | 'full';
}

const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(
  ({
    value = '',
    onChange,
    placeholder = 'Start typing...',
    disabled = false,
    className,
    minHeight = 150,
    maxHeight,
    variant = 'default'
  }, ref) => {

    const getToolbarConfig = () => {
      switch (variant) {
        case 'minimal':
          return [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
          ];
        case 'full':
          return [
            // Font family dan style
            [{ 'font': [] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            // Alignment dan paragraf
            [{ 'align': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],


            // Styling: bold, italic, underline, strike, script
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'script': 'super' }, { 'script': 'sub' }],

            // Block quote, code
            ['blockquote', 'code-block'],

            // Text color and background
            [{ 'color': [] }, { 'background': [] }],

            // Clear formatting
            ['clean'],
          ];
        default: // 'default'
          return [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            [{ 'color': [] }],
            ['clean']
          ];
      }
    };

    const getFormats = () => {
      switch (variant) {
        case 'minimal':
          return [
            'bold', 'italic', 'underline',
            'list', 'bullet',
            'clean'
          ];
        case 'full':
          return [
            'font', 'header',
            'align',
            'list', 'bullet', 'check', 'indent',
            'bold', 'italic', 'underline', 'strike',
            'script',
            'blockquote', 'code-block',
            'color', 'background',
            'clean'
          ];
        default:
          return [
            'header',
            'bold', 'italic', 'underline', 'strike',
            'list', 'bullet',
            'align',
            'blockquote', 'code-block',
            'color',
            'clean'
          ];
      }
    };

    const modules = {
      toolbar: getToolbarConfig(),
    };

    const formats = getFormats();

    return (
      <div
        className={cn(
          "rich-text-editor border border-input rounded-md overflow-hidden",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: maxHeight ? `${maxHeight}px` : undefined,
        }}
      >
        <ReactQuill
          ref={ref}
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={disabled}
          modules={modules}
          formats={formats}
          style={{
            height: '100%',
            minHeight: `${minHeight}px`,
          }}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };
export type { RichTextEditorProps };