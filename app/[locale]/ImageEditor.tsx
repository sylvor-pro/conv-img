"use client";
import React, { useCallback, useEffect, useRef, useReducer } from "react";
import "./devicon.min.css";
import {
  Spinner,
} from "@nextui-org/react";
import { useConvImg } from "./ConvImgContext";

interface ImageEditorProps {
  isDragMode: boolean;
  elements: {
    title: { x: number; y: number; visible: boolean };
    author: { x: number; y: number; visible: boolean };
    icon: { x: number; y: number; visible: boolean };
    image: { x: number; y: number };
  };
  setElements: React.Dispatch<React.SetStateAction<{
    title: { x: number; y: number; visible: boolean };
    author: { x: number; y: number; visible: boolean };
    icon: { x: number; y: number; visible: boolean };
    image: { x: number; y: number };
  }>>;
  saveHistory: (elements: any) => void;
  handleResetLayout: () => void;
}

type DraggableElement = 'title' | 'author' | 'icon' | 'image' | null;

const GRID_STEP = 10;

export const ImageEditor = ({ 
  isDragMode, 
  elements, 
  setElements,
  saveHistory,
  handleResetLayout
}: ImageEditorProps) => {
  const { 
    propertyInfo, 
    imageInfo, 
    backgroundType,
    backgroundColor, 
    backgroundPattern,
    elementsLayout
  } = useConvImg();
  
  const {
    aspect,
    blur,
    blurTrans,
    title,
    subTitle,
    author,
    icon,
    devicon,
    font,
    fontSizeValue,
    authorFontSizeValue,
    color,
    logoPosition,
    titleWidthValue,
  } = propertyInfo;

  const [isLoading, setIsLoading] = React.useState(false);
  const [imagePosition, setImagePosition] = React.useState(0);
  const [gridLines, setGridLines] = React.useState({ horizontal: 0, vertical: 0 });
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartY, setDragStartY] = React.useState(0);
  const [draggingElement, setDraggingElement] = React.useState<DraggableElement>(null);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const snapToGrid = (value: number): number => {
    return Math.round(value / GRID_STEP) * GRID_STEP;
  };

  useEffect(() => {
    if (imageInfo.url) {
      setIsLoading(true);
    }
  }, [imageInfo.url]);

  useEffect(() => {
    const centerImageVertically = () => {
      if (imageRef.current && containerRef.current) {
        setImagePosition(0);
      }
    };
    
    const handleImageLoad = () => {
      setIsLoading(false);
      centerImageVertically();
    };
    
    const imgElement = imageRef.current;
    if (imgElement) {
      imgElement.addEventListener('load', handleImageLoad);
    }
    
    return () => {
      if (imgElement) {
        imgElement.removeEventListener('load', handleImageLoad);
      }
    };
  }, [imageInfo.url]);
  
  useEffect(() => {
    if (containerRef.current && isDragMode) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      const MAX_LINES = 1000;
      const horizontalLines = Math.min(Math.floor(height / GRID_STEP), MAX_LINES);
      const verticalLines = Math.min(Math.floor(width / GRID_STEP), MAX_LINES);
      
      setGridLines({ horizontal: horizontalLines, vertical: verticalLines });
    }
  }, [isDragMode, containerRef.current?.clientWidth, containerRef.current?.clientHeight]);

  // 
  const handleImageMouseDown = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDragMode) return;
    setIsDragging(true);
    setDragStartY(e.clientY - imagePosition);
    setDragStart({ 
      x: e.clientX,
      y: e.clientY - imagePosition 
    });
    e.stopPropagation();
  }, [isDragMode, imagePosition]);

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragMode) return;
    
    const isClickOnDraggableElement = e.target !== containerRef.current;
    
    if (!isClickOnDraggableElement) {
      setIsDragging(true);
      setDragStartY(e.clientY - imagePosition);
      setDragStart({ 
        x: e.clientX,
        y: e.clientY - imagePosition 
      });
    }
  };
  
  const handleElementDragStart = (element: DraggableElement, e: React.MouseEvent) => {
    if (!isDragMode) return;
    e.stopPropagation();
    setDraggingElement(element);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && imageRef.current) {
      const newVerticalPosition = e.clientY - dragStartY;
      
      const container = containerRef.current;
      const image = imageRef.current;
      
      if (container && image) {
        const imageHeight = image.getBoundingClientRect().height;
        const containerHeight = container.getBoundingClientRect().height;
        
        let minY, maxY;
        
        if (imageHeight <= containerHeight) {
          minY = -imageHeight;  
          maxY = containerHeight; 
        } else {
         
          minY = containerHeight - imageHeight * 1.8; 
          maxY = imageHeight * 0.8; 
        }
        
        const boundedY = snapToGrid(Math.max(minY, Math.min(maxY, newVerticalPosition)));
        
        setImagePosition(boundedY);
        
        setDragStartY(e.clientY - boundedY);
      } else {
        setImagePosition(newVerticalPosition);
        setDragStartY(e.clientY - newVerticalPosition);
      }
    }
    
    
    if (draggingElement && isDragMode) {
      const deltaX = snapToGrid(e.clientX - dragStart.x);
      const deltaY = snapToGrid(e.clientY - dragStart.y);
      
      if (deltaX !== 0 || deltaY !== 0) {
        handleElementDrag(draggingElement, deltaX, deltaY);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };
  

  const handleElementDrag = (elementKey: DraggableElement, deltaX: number, deltaY: number) => {
    if (!elementKey) return;
    
    setElements(prev => {
      const newElements = {...prev};
      
     
      if (elementKey === 'image') {
        newElements[elementKey] = {
          ...newElements[elementKey],
          x: snapToGrid(newElements[elementKey].x + deltaX),
          y: snapToGrid(newElements[elementKey].y + deltaY)
        };
      } else {
 
        newElements[elementKey] = {
          ...newElements[elementKey],
          x: snapToGrid(newElements[elementKey].x + deltaX),
          y: snapToGrid(newElements[elementKey].y + deltaY),
          visible: (newElements[elementKey] as any).visible 
        };
      }
      
      return newElements;
    });
  };
  
  const handleMouseUp = () => {
    if (isDragging || draggingElement) {
      saveHistory(elements);
    }
    setIsDragging(false);
    setDraggingElement(null);
  };
  
  useEffect(() => {
    if (isDragging || draggingElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartY, draggingElement, dragStart, isDragMode]);
  
  const renderIcon = () => {
    if (devicon.length !== 0) {
      return (
        <div 
          className={`m-4 items-center justify-center flex ${isDragMode ? 'cursor-move' : ''}`}
          onMouseDown={(e) => handleElementDragStart('icon', e)}
        >
          <i className={`devicon-${devicon} text-white dev-icon text-4xl`}></i>
        </div>
      );
    } else if (icon.length > 0) {
      return (
        <div 
          className={`${isDragMode ? 'cursor-move' : ''}`}
          onMouseDown={(e) => handleElementDragStart('icon', e)}
        >
          <img
            src={icon}
            alt="img"
            className="w-12 h-12 m-2 rounded-full"
          />
        </div>
      );
    }
    return null;
  };
  
  const calculateAspectRatio = () => {
    if (!aspect || !aspect.includes('/')) {
      return { width: '90vh', height: '90vh' };
    }
    
    try {
      const ratioStr = aspect.replace('aspect-[', '').replace(']', '');
      const [w, h] = ratioStr.split('/').map(n => parseFloat(n.trim()));
      
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        return { width: '90vh', height: '90vh' };
      }
      
      if (Math.abs(w - h) < 0.01) {
        return { width: '90vh', height: '90vh' };
      } else if (h > w) {
        return { width: `${90 * w / h}vh`, height: '90vh' };
      } else {
        return { width: '90vh', height: `${90 * h / w}vh` };
      }
    } catch (e) {
      return { width: '90vh', height: '90vh' };
    }
  };
  
  const renderBackground = () => {
    switch (backgroundType) {
      case 'image':
        return (
          <img
            ref={imageRef}
            src={imageInfo.url}
            alt="Background"
            className={`rounded-md ${isDragMode ? 'cursor-move' : ''}`}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',

              objectPosition: isDragging ? `center ${imagePosition}px` : 'center center',
              transition: isDragging ? 'none' : 'all 0.1s ease-out',
            }}
            onMouseDown={handleImageMouseDown}
            draggable={false}
          />
        );
      case 'color':
        return (
          <div
            className="rounded-md w-full h-full"
            style={{ 
              background: backgroundColor,
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        );
      case 'pattern':
        return (
          <div
            className="rounded-md w-full h-full"
            style={{ 
              background: backgroundPattern.split('|')[0], 
              backgroundColor: backgroundPattern.split('|')[1] || '#ffffff',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        );
      case 'svg':
        return (
          <div
            className="rounded-md w-full h-full"
            style={{ 
              backgroundImage: backgroundPattern,
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        );
      default:
        return null;
    }
  };
  
  const renderGrid = () => {
    if (!isDragMode) return null;
    
    return (
      <>

        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>
        
        <div className="absolute inset-0 pointer-events-none">

          {Array.from({ length: gridLines.horizontal }).map((_, i) => (
            <div 
              key={`h-${i}`} 
              className="absolute left-0 right-0 border-t border-white/10"
              style={{ top: `${i * GRID_STEP}px`, height: '1px' }}
            ></div>
          ))}
          
          {Array.from({ length: gridLines.vertical }).map((_, i) => (
            <div 
              key={`v-${i}`} 
              className="absolute top-0 bottom-0 border-l border-white/10" 
              style={{ left: `${i * GRID_STEP}px`, width: '1px' }}
            ></div>
          ))}
        </div>
      </>
    );
  };
  
  const renderDraggableElements = () => {
    return (
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        <div 
          className={`absolute ${isDragMode ? 'cursor-move border border-dashed border-white/30' : ''}`}
          style={{ 
            left: '50%',
            top: '40%',
            transform: `translate(-50%, -50%) translate(${elements.title.x}px, ${elements.title.y}px)`,
            transition: draggingElement === 'title' ? 'none' : 'transform 0.1s ease-out',
            padding: isDragMode ? '8px' : '0',
            pointerEvents: isDragMode ? 'auto' : 'none',
            visibility: elements.title.visible ? 'visible' : 'hidden',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onMouseDown={(e) => handleElementDragStart('title', e)}
        >
          <h1
            className={`leading-tight text-center text-5xl font-bold text-white ${font}`}
            style={{ 
              fontSize: `${fontSizeValue}px`,
              width: titleWidthValue ? `${titleWidthValue}%` : 'auto',
              wordWrap: 'break-word'
            }}
          >
            {title}
          </h1>
        </div>
        
        <div 
          className={`absolute ${isDragMode ? 'cursor-move border border-dashed border-white/30' : ''}`}
          style={{ 
            left: '50%',
            top: '60%',
            transform: `translate(-50%, -50%) translate(${elements.author.x}px, ${elements.author.y}px)`,
            transition: draggingElement === 'author' ? 'none' : 'transform 0.1s ease-out',
            padding: isDragMode ? '8px' : '0',
            pointerEvents: isDragMode ? 'auto' : 'none',
            visibility: elements.author.visible ? 'visible' : 'hidden'
          }}
          onMouseDown={(e) => handleElementDragStart('author', e)}
        >
          <h2
            className={`text-xl font-semibold text-center text-white ${font}`}
            style={{ fontSize: `${authorFontSizeValue}px` }}
          >
            {author}
          </h2>
        </div>
        
        {(devicon.length > 0 || icon.length > 0) && (
          <div 
            className={`absolute ${isDragMode ? 'cursor-move border border-dashed border-white/30' : ''}`}
            style={{ 
              left: logoPosition === "default" ? '50%' : '0',
              top: logoPosition === "default" ? '70%' : '0',
              transform: `translate(${logoPosition === "default" ? '-50%, -50%' : '0, 0'}) translate(${elements.icon.x}px, ${elements.icon.y}px)`,
              transition: draggingElement === 'icon' ? 'none' : 'transform 0.1s ease-out',
              padding: isDragMode ? '8px' : '0',
              pointerEvents: isDragMode ? 'auto' : 'none',
              visibility: elements.icon.visible ? 'visible' : 'hidden'
            }}
            onMouseDown={(e) => handleElementDragStart('icon', e)}
          >
            {renderIcon()}
          </div>
        )}
      </div>
    );
  };
  
  const aspectRatio = calculateAspectRatio();
  
  useEffect(() => {
    if (elementsLayout) {
      setElements(prev => ({
        ...prev,
        title: {
          ...elementsLayout.title,
        },
        author: {
          ...elementsLayout.author,
        },
        icon: {
          ...elementsLayout.icon,
        },
        image: prev.image
      }));
      
      saveHistory(elementsLayout);
    }
  }, [elementsLayout]);
  
  useEffect(() => {
    handleResetLayout();
  }, []);
  
  return (
    <div className="max-h-screen relative flex group rounded-3xl">
      <div
        ref={containerRef}
        style={{ 
          maxHeight: "90vh", 
          minHeight: "50vh",
          overflow: "hidden", 
          position: "relative",
          pointerEvents: "auto",
          width: aspectRatio.width,
          height: aspectRatio.height,
        }}
        className="rounded-md"
        onMouseDown={isDragMode ? handleContainerMouseDown : undefined}
      >
        {renderBackground()}
        
        {renderGrid()}
      </div>

      <div
        style={{
          backgroundColor: color == "" ? "#1F293799" : color + blurTrans,
          pointerEvents: isDragMode ? 'none' : 'auto',
          zIndex: 1
        }}
        className={`absolute top-0 right-0 left-0 rounded-md h-full ${blur}`}
      >
        {renderDraggableElements()}

        {isLoading && <Spinner className="absolute bottom-8 left-8" />}
      </div>

      {backgroundType === 'image'}
    </div>
  );
};

declare global {
  interface Window {
    ImageEditorState?: {
      isDragMode: boolean;
      setIsDragMode: (value: boolean) => void;
      handleResetLayout: () => void;
      history: any[];
      historyIndex: number;
      setElements: (elements: any) => void;
      setHistoryIndex: (index: number) => void;
      saveHistory: () => void;
    };
  }
}
