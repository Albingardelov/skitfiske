// __tests__/components/chat/MessageBubble.test.tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import MessageBubble from '@/components/chat/MessageBubble';
import theme from '@/lib/theme';
import type { Message } from '@/types/chat';

const baseMessage: Message = {
  id: '1',
  channel_id: 'ch1',
  user_id: 'user1',
  full_name: 'Erik Johansson',
  content: 'Hej allihopa!',
  image_url: null,
  created_at: '2026-04-11T10:23:00Z',
};

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('MessageBubble', () => {
  it('visar avsändarförnamn i tidsrad för andras meddelanden', () => {
    renderWithTheme(<MessageBubble message={baseMessage} isOwn={false} />);
    expect(screen.getByText(/· Erik/)).toBeInTheDocument();
  });

  it('visar inte avsändarnamn för egna meddelanden', () => {
    renderWithTheme(<MessageBubble message={baseMessage} isOwn={true} />);
    expect(screen.queryByText(/· Erik/)).not.toBeInTheDocument();
  });

  it('renderar meddelandetext', () => {
    renderWithTheme(<MessageBubble message={baseMessage} isOwn={false} />);
    expect(screen.getByText('Hej allihopa!')).toBeInTheDocument();
  });

  it('renderar bild när image_url är satt', () => {
    const msg = { ...baseMessage, image_url: 'https://example.com/img.jpg' };
    renderWithTheme(<MessageBubble message={msg} isOwn={false} />);
    expect(screen.getByAltText('Bifogad bild')).toBeInTheDocument();
  });

  it('renderar inte bild när image_url är null', () => {
    renderWithTheme(<MessageBubble message={baseMessage} isOwn={false} />);
    expect(screen.queryByAltText('Bifogad bild')).not.toBeInTheDocument();
  });

  it('visar menyknapp för egna meddelanden när redigera/radera finns', () => {
    renderWithTheme(
      <MessageBubble
        message={baseMessage}
        isOwn={true}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Meddelandealternativ' })).toBeInTheDocument();
  });

  it('visar inte menyknapp för andras meddelanden', () => {
    renderWithTheme(
      <MessageBubble
        message={baseMessage}
        isOwn={false}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Meddelandealternativ' })).not.toBeInTheDocument();
  });
});
