interface LayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="">
        {children}
      </div>
    </div>
  );
}