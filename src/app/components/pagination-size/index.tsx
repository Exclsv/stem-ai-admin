import { FC } from 'react';
import { Form } from 'react-bootstrap';

interface SDSelectProps {
  options?: { value: number; label: string }[];
  value: string | number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const SDPaginationSize: FC<SDSelectProps> = ({
  options = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 30, label: '30' },
    { value: 40, label: '40' },
    { value: 50, label: '50' },
  ],
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="sd-pagination-size">
      <Form.Group>
        <Form.Select
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          disabled={disabled}
          className="sd-pagination-size-select"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
  );
};

export { SDPaginationSize };
