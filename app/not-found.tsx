"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import FuzzyText from "@/components/shared/fuzzy-text";
import { useTheme } from "next-themes";

export default function NotFound() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const [textColor, setTextColor] = useState("#fff");

  // Ensure we're on the client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update text color based on theme
  useEffect(() => {
    setTextColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isClient) {
    return <div className='min-h-screen bg-background flex items-center justify-center'></div>;
  }

  return (
    <div
      className='min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden'
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className='absolute inset-0 pointer-events-none'>
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className='absolute w-2 h-2 bg-muted rounded-full opacity-40'
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
      </div>

      <div className='text-center space-y-12 max-w-2xl w-full relative z-10'>
        <div
          className='flex justify-center'
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <FuzzyText
            fontSize='clamp(4rem, 8vw, 8rem)'
            fontWeight={900}
            fontFamily='inherit'
            enableHover={true}
            color={textColor}
            baseIntensity={0.15}
            hoverIntensity={0.6}
          >
            404
          </FuzzyText>
        </div>

        <div className='space-y-8'>
          <div className='space-y-4'>
            <h1 className='text-4xl md:text-5xl font-bold text-foreground'>Oops! Page not found</h1>
            <p className='text-muted-foreground text-xl leading-relaxed max-w-lg mx-auto'>
              The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track!
            </p>
          </div>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Button onClick={handleGoBack} size='lg' className='w-full sm:w-auto text-base px-8 py-3'>
              <ArrowLeft className='w-5 h-5 mr-2' />
              Go Back
            </Button>

            <Button onClick={handleRefresh} variant='ghost' size='lg' className='w-full sm:w-auto text-base px-8 py-3'>
              <RefreshCw className='w-5 h-5 mr-2' />
              Refresh
            </Button>
          </div>
        </div>

        <div className='flex justify-center items-center space-x-8 pt-8'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-destructive rounded-full animate-pulse' />
            <span className='text-sm text-muted-foreground'>Page Missing</span>
          </div>
          <div className='flex items-center space-x-2'>
            <div
              className='w-2 h-2 bg-green-500 rounded-full animate-pulse' // replaced bg-live with bg-green-500
              style={{ animationDelay: "0.5s" }}
            />
            <span className='text-sm text-muted-foreground'>Site Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
