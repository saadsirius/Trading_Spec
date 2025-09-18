import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

function Dummy({ onClick }: { onClick: ()=>Promise<boolean> | boolean }) {
  return <button onClick={() => onClick()} aria-label="dummy">Run</button>;
}

describe('Click Handlers', () => {
  it('executes callback and resolves boolean', async () => {
    const onClick = jest.fn().mockResolvedValue(true);
    render(<Dummy onClick={onClick} />);
    fireEvent.click(screen.getByLabelText('dummy'));
    await waitFor(() => expect(onClick).toHaveBeenCalled());
  });
});
