import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LanguageProvider, { useLanguage } from '../LanguageProvider';

const TestComponent = () => {
  const { locale, direction, toggleLanguage, dict } = useLanguage();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="direction">{direction}</span>
      <span data-testid="dict-appName">{dict?.common?.appName}</span>
      <button data-testid="toggle-btn" onClick={toggleLanguage}>Toggle</button>
    </div>
  );
};

describe('LanguageProvider', () => {
  let getItemMock;
  let setItemMock;

  beforeEach(() => {
    getItemMock = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    setItemMock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    document.documentElement.dir = '';
    document.documentElement.lang = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders and provides context with default "en" state', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Assert initial state is "en" because locale state defaults to 'en'
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');
    expect(screen.getByTestId('dict-appName')).toHaveTextContent('UniZy');

    // Also assert that document attributes are updated on mount
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    expect(getItemMock).toHaveBeenCalledWith('unizy-locale');
  });

  it('loads saved locale from localStorage on mount', () => {
    getItemMock.mockReturnValue('ar');

    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Initial state before effect runs is 'en', but effect updates it to 'ar'
    expect(screen.getByTestId('locale')).toHaveTextContent('ar');
    expect(screen.getByTestId('direction')).toHaveTextContent('rtl');

    // Check document attributes
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });

  it('toggles language and updates localStorage and document attributes', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Initially "en"
    expect(screen.getByTestId('locale')).toHaveTextContent('en');

    // Click toggle
    act(() => {
      screen.getByTestId('toggle-btn').click();
    });

    // Now it should be "ar"
    expect(screen.getByTestId('locale')).toHaveTextContent('ar');
    expect(screen.getByTestId('direction')).toHaveTextContent('rtl');

    // Check local storage and document
    expect(setItemMock).toHaveBeenCalledWith('unizy-locale', 'ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');

    // Click toggle again
    act(() => {
      screen.getByTestId('toggle-btn').click();
    });

    // Now it should be back to "en"
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('direction')).toHaveTextContent('ltr');

    // Check local storage and document again
    expect(setItemMock).toHaveBeenCalledWith('unizy-locale', 'en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
  });

  it('mounts children with correct visibility', () => {
    const { container } = render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // The wrapper div should have visibility visible after mount (useEffect runs)
    expect(container.firstChild).toHaveStyle({ visibility: 'visible' });
  });
});
