"use client";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">404</h1>
        <p className="text-lg text-muted-foreground">Page Not Found</p>
      </div>
    </div>
  );
};

export default NotFound;
