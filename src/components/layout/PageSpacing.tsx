type PageSpacingHeight = 'default' | 'no_spacing' | string;

interface PageSpacingProps {
  // Height can be 'default' (112px), 'no_spacing' (56px - navbar height), or any arbitrary value
  height?: PageSpacingHeight;
  // Optional className for additional styling
  className?: string;
}

export function PageSpacing({ height = 'default', className = "" }: PageSpacingProps) {
  const getHeight = () => {
    switch (height) {
      case 'default':
        return '112px'; // Navbar height (56px) + additional spacing (56px)
      case 'no_spacing':
        return '56px'; // Just navbar height
      default:
        return height;
    }
  };

  return <div style={{ height: getHeight() }} className={className} />;
}
