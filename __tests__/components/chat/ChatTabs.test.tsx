// __tests__/components/chat/ChatTabs.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import ChatTabs from '@/components/chat/ChatTabs';
import theme from '@/lib/theme';
import type { Channel } from '@/types/chat';

const channels: Channel[] = [
  { id: 'ch1', name: 'allmant', label: 'Allmänt' },
  { id: 'ch2', name: 'fangster', label: 'Fångster' },
  { id: 'ch3', name: 'utrustning', label: 'Utrustning' },
];

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('ChatTabs', () => {
  it('renderar alla tre kanaler', () => {
    renderWithTheme(
      <ChatTabs channels={channels} activeChannelId="ch1" onChannelChange={jest.fn()} />
    );
    expect(screen.getByText('Allmänt')).toBeInTheDocument();
    expect(screen.getByText('Fångster')).toBeInTheDocument();
    expect(screen.getByText('Utrustning')).toBeInTheDocument();
  });

  it('anropar onChannelChange med rätt id vid klick', async () => {
    const onChannelChange = jest.fn();
    renderWithTheme(
      <ChatTabs channels={channels} activeChannelId="ch1" onChannelChange={onChannelChange} />
    );
    await userEvent.click(screen.getByText('Fångster'));
    expect(onChannelChange).toHaveBeenCalledWith('ch2');
  });

  it('renderar ingenting när channels är tom', () => {
    renderWithTheme(
      <ChatTabs channels={[]} activeChannelId="" onChannelChange={jest.fn()} />
    );
    expect(screen.queryByText('Allmänt')).not.toBeInTheDocument();
  });
});
