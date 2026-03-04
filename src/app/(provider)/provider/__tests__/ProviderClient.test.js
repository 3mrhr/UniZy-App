import { render, screen } from '@testing-library/react';
import ProviderClient from '../ProviderClient';

// Mock dependencies
jest.mock('@/i18n/LanguageProvider', () => ({
  useLanguage: () => ({ dict: {} })
}));

jest.mock('@/components/ThemeLangControls', () => {
  return function MockThemeLangControls() {
    return <div data-testid="theme-lang-controls" />;
  };
});

// Since Next.js 13+ Link component can be complex to test, we mock it
jest.mock('next/link', () => {
  return ({ children, href }) => (
    <a href={href}>{children}</a>
  );
});

describe('ProviderClient - Image Parsing Error Handling', () => {
  it('handles invalid JSON in listing.images gracefully', () => {
    const mockListings = [
      {
        id: 1,
        title: 'Test Invalid JSON Listing',
        price: 1000,
        status: 'ACTIVE',
        images: 'invalid-json' // This will throw an error in JSON.parse
      }
    ];

    render(<ProviderClient settlements={[]} dbListings={mockListings} dbLeads={[]} />);

    expect(screen.getByText('Test Invalid JSON Listing')).toBeInTheDocument();
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('renders correctly when images is a valid JSON array with image URLs', () => {
    const mockListings = [
      {
        id: 2,
        title: 'Test Valid Image Listing',
        price: 2000,
        status: 'ACTIVE',
        images: '["/valid-image.png", "/another-image.png"]' // Valid JSON
      }
    ];

    render(<ProviderClient settlements={[]} dbListings={mockListings} dbLeads={[]} />);

    const validImage = screen.getByAltText('Test Valid Image Listing');
    expect(validImage).toBeInTheDocument();
    expect(validImage.src).toContain('/valid-image.png');
    // Ensure "No Image" placeholder text isn't shown
    expect(screen.queryByText('No Image')).not.toBeInTheDocument();
  });

  it('renders "No Image" fallback when images is an empty array', () => {
    const mockListings = [
      {
        id: 3,
        title: 'Test Empty Array Listing',
        price: 1500,
        status: 'ACTIVE',
        images: '[]' // Valid JSON, empty array
      }
    ];

    render(<ProviderClient settlements={[]} dbListings={mockListings} dbLeads={[]} />);

    expect(screen.getByText('Test Empty Array Listing')).toBeInTheDocument();
    expect(screen.getByText('No Image')).toBeInTheDocument();
  });

  it('renders "No Image" fallback when images is null or undefined string', () => {
    const mockListings = [
      {
        id: 4,
        title: 'Test Null Images Listing',
        price: 1200,
        status: 'ACTIVE',
        images: null // Will throw error when trying to parse or parse as null
      },
      {
        id: 5,
        title: 'Test Undefined Images Listing',
        price: 1300,
        status: 'ACTIVE',
        images: undefined
      }
    ];

    render(<ProviderClient settlements={[]} dbListings={mockListings} dbLeads={[]} />);

    expect(screen.getByText('Test Null Images Listing')).toBeInTheDocument();
    expect(screen.getByText('Test Undefined Images Listing')).toBeInTheDocument();

    // There should be two "No Image" texts
    const noImageElements = screen.getAllByText('No Image');
    expect(noImageElements).toHaveLength(2);
  });
});
