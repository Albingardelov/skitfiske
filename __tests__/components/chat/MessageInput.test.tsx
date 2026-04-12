import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import MessageInput from '@/components/chat/MessageInput';
import theme from '@/lib/theme';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('MessageInput', () => {
  it('skicka-knappen är disabled när input är tom', () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} />);
    expect(screen.getByRole('button', { name: /skicka/i })).toBeDisabled();
  });

  it('skicka-knappen aktiveras när text skrivs', async () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} />);
    await userEvent.type(screen.getByRole('textbox'), 'Hej!');
    expect(screen.getByRole('button', { name: /skicka/i })).not.toBeDisabled();
  });

  it('anropar onSend med text och null bild vid klick', async () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} />);
    await userEvent.type(screen.getByRole('textbox'), 'Testmeddelande');
    await userEvent.click(screen.getByRole('button', { name: /skicka/i }));
    expect(onSend).toHaveBeenCalledWith('Testmeddelande', null);
  });

  it('rensar textfältet efter skickat', async () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test');
    await userEvent.click(screen.getByRole('button', { name: /skicka/i }));
    expect(input).toHaveValue('');
  });

  it('är disabled när disabled-prop är satt', () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
