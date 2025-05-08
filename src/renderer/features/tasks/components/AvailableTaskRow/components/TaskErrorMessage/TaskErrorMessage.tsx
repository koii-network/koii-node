import React from 'react';

export function TaskErrorMessage({ errors }: { errors: string[] }) {
  if (errors.length === 0) {
    return null;
  } else if (errors.length === 1) {
    return <span>{`Make sure you ${errors[0]}.`}</span>;
  } else {
    const errorList = errors.map((error) => <li key={error}>• {error}</li>);
    return (
      <div>
        Make sure you:
        <br />
        <ul> {errorList}</ul>
      </div>
    );
  }
}
