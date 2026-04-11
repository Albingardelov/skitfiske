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
    // Lucide Send-ikon renderas inuti en IconButton — aria-label finns på knappen
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons[buttons.length - 1]; // sista knappen är Skicka
    expect(sendButton).toBeDisabled();
  });

  it('skicka-knappen aktiveras när text skrivs', async () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} />);
    await userEvent.type(screen.getByRole('textbox'), 'Hej!');
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons[buttons.length - 1];
    expect(sendButton).not.toBeDisabled();
  });

  it('anropar onSend med text och null bild vid klick', async () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} />);
    await userEvent.type(screen.getByRole('textbox'), 'Testmeddelande');
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[buttons.length - 1]);
    expect(onSend).toHaveBeenCalledWith('Testmeddelande', null);
  });

  it('rensar textfältet efter skickat', async () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test');
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[buttons.length - 1]);
    expect(input).toHaveValue('');
  });

  it('är disabled när disabled-prop är satt', () => {
    const onSend = jest.fn();
    renderWithTheme(<MessageInput onSend={onSend} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
