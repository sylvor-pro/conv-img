"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { config } from "@/config";
import { SVG_BACKGROUNDS } from "./svgBackgrounds";

// Define image info interface
interface ImageInfo {
  url: string;
  name: string;
  avatar: string;
  profile: string;
  downloadLink: string;
  width?: number;
  height?: number;
  key?: string;
  alt?: string;
  src?: string;
}

// Define property info interface
interface PropertyInfo {
  font: string;
  fontSizeValue: number | string;
  authorFontSizeValue: number | string;
  title: string;
  subTitle: string;
  author: string;
  icon: string;
  devicon: string;
  color: string;
  aspect: string;
  blur: string;
  blurTrans: string;
  logoPosition: string;
  customWidth: number;
  customHeight: number;
  isCustomAspect: boolean;
  titleWidthValue?: number | string;
}

// Define background type
type BackgroundType = 'image' | 'color' | 'pattern' | 'svg';

// Modify SvgParams type definition
interface SvgParams {
  color1: string;
  color2: string;
  backgroundColor: string;
  height?: number;
  amplitude?: number;
  frequency?: number;
  layers?: number;
  speed?: number;
  rotation?: number;
  contrast?: number;
  wavesOpacity?: number;
  style?: string;
  direction?: string;
  useGradientBg?: boolean;
  
  // Corner pattern parameters
  cornerRadius?: number;
  cornerCount?: number;
  strokeWidth?: number;
  position?: string[];
  mirrorEdges?: boolean;
  balance?: number;
  velocity?: number;
  layerDistance?: number;
  offsetX?: number;
  offsetY?: number;
  radius?: number;
  shadowColor?: string;
}

// Add SVG template params type definition
interface SvgTemplateParams {
  [key: string]: any;
}

// Add SVG template type definition
interface SvgTemplate {
  name: string;
  svgTemplate: (params: SvgTemplateParams) => string;
  defaultParams: SvgTemplateParams;
}

// Define element layout interface
interface ElementLayout {
  title: { x: number; y: number; visible: boolean };
  author: { x: number; y: number; visible: boolean };
  icon: { x: number; y: number; visible: boolean };
}

// Define Context type
interface ConvImgContextType {
  // Image info
  imageInfo: ImageInfo;
  setImageInfo: (info: ImageInfo) => void;
  
  // Property info
  propertyInfo: PropertyInfo;
  updateProperty: <K extends keyof PropertyInfo>(key: K, value: PropertyInfo[K]) => void;
  
  // Download image
  downloadImage: (format: string) => void;
  
  // Background type and color
  backgroundType: BackgroundType;
  setBackgroundType: (type: BackgroundType) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  
  // Add pattern background related property
  backgroundPattern: string;
  setBackgroundPattern: (pattern: string) => void;
  
  // Add SVG related property
  selectedSvgIndex: number | null;
  setSelectedSvgIndex: (index: number | null) => void;
  svgPatternParams: SvgTemplateParams;
  setSvgPatternParams: (params: SvgTemplateParams) => void;
  showSvgPanel: boolean;
  setShowSvgPanel: (show: boolean) => void;
  
  // Add layout related property
  elementsLayout: ElementLayout;
  setElementsLayout: (layout: ElementLayout) => void;
}

// Create default image info
const defaultImageInfo: ImageInfo = {
  url: "stacked-waves.svg",
  name: "ConvImg",
  avatar: "default-author.jpg",
  profile: "default",
  downloadLink: "",
};

// Create default property info
const defaultPropertyInfo: PropertyInfo = {
  font: config.font,
  fontSizeValue: config.fontSize,
  authorFontSizeValue: config.authorFontSize,
  title: config.title[Math.floor(Math.random() * 4)],
  subTitle: config.subTitle,
  author: config.author,
  icon: config.icon,
  devicon: config.deviconValue[0] || "",
  color: config.backColor,
  aspect: config.aspect,
  blur: "backdrop-blur-none",
  blurTrans: (Math.floor(2.55 * config.blurTrans)).toString(16),
  logoPosition: config.logoPosition,
  customWidth: 1920,
  customHeight: 1080,
  isCustomAspect: false,
  titleWidthValue: 100,
};

// Create default layout config
const defaultElementsLayout: ElementLayout = {
  title: { x: 0, y: 0, visible: true },
  author: { x: 0, y: 80, visible: true },
  icon: { x: 0, y: 160, visible: true },
};

// Create Context
const ConvImgContext = createContext<ConvImgContextType | undefined>(undefined);

// Context Provider component
export function ConvImgProvider({ 
  children, 
  onDownload 
}: { 
  children: React.ReactNode, 
  onDownload: (format: string) => void 
}) {
  // Create default property info
  const initialPropertyInfo = React.useMemo(() => {
    // Use the first title instead of random
    return {
      ...defaultPropertyInfo,
      title: config.title[0] // 使用固定的第一个标题
    };
  }, []);

  const [imageInfo, setImageInfo] = useState<ImageInfo>(defaultImageInfo);
  const [propertyInfo, setPropertyInfo] = useState<PropertyInfo>(initialPropertyInfo);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('image');
  const [backgroundColor, setBackgroundColor] = useState<string>('#1F2937');
  const [backgroundPattern, setBackgroundPattern] = useState<string>("");
  
  // Add mask opacity for three states
  const [imageBlurTrans, setImageBlurTrans] = useState<string>((Math.floor(2.55 * config.blurTrans)).toString(16));
  const [colorBlurTrans, setColorBlurTrans] = useState<string>("00"); // 颜色模式默认透明
  const [patternBlurTrans, setPatternBlurTrans] = useState<string>("99"); // 纹理模式默认60%浓度 (153/255 ≈ 0.6 = 60%)

  // Add SVG related state
  const [selectedSvgIndex, setSelectedSvgIndex] = useState<number | null>(null);
  const [svgPatternParams, setSvgPatternParams] = useState<SvgTemplateParams>({});
  const [showSvgPanel, setShowSvgPanel] = useState(false);

  // Add layout state
  const [elementsLayout, setElementsLayout] = useState<ElementLayout>(defaultElementsLayout);

  // Use useEffect to set random title, only runs on client
  useEffect(() => {
    // Only run random selection on client
    const randomTitle = config.title[Math.floor(Math.random() * config.title.length)];
    setPropertyInfo(prev => ({
      ...prev,
      title: randomTitle
    }));
  }, []);

  // Update single property
  const updateProperty = <K extends keyof PropertyInfo>(key: K, value: PropertyInfo[K]) => {
    setPropertyInfo(prev => ({
      ...prev,
      [key]: value
    }));
    
    // If user is updating mask opacity, also save to corresponding state based on current background type
    if (key === "blurTrans" && typeof value === "string") {
      if (backgroundType === 'image') {
        setImageBlurTrans(value);
      } else if (backgroundType === 'color') {
        setColorBlurTrans(value);
      } else if (backgroundType === 'pattern') {
        setPatternBlurTrans(value);
      }
    }
  };

  // Modify background type setter, also switch corresponding mask opacity when changing background type
  const handleBackgroundTypeChange = (type: BackgroundType) => {
    // Update background type
    setBackgroundType(type);
    
    // Apply corresponding mask opacity based on new background type
    if (type === 'color') {
      updateProperty("blurTrans", colorBlurTrans);
    } else if (type === 'image') {
      updateProperty("blurTrans", imageBlurTrans);
    } else if (type === 'pattern') {
      updateProperty("blurTrans", patternBlurTrans);
    }
  };

  // Handle special logic for blur property
  useEffect(() => {
    let blurLevel: string = "backdrop-blur-none";
    if (typeof propertyInfo.blur === "number") {
      const blurValue = propertyInfo.blur as number;
      if (blurValue == 0) {
        blurLevel = "backdrop-blur-none";
      } else if (blurValue == 20) {
        blurLevel = "backdrop-blur-sm";
      } else if (blurValue == 40) {
        blurLevel = "backdrop-blur";
      } else if (blurValue == 60) {
        blurLevel = "backdrop-blur-md";
      } else if (blurValue == 80) {
        blurLevel = "backdrop-blur-lg";
      } else if (blurValue == 100) {
        blurLevel = "backdrop-blur-xl";
      }
      updateProperty("blur", blurLevel);
    }
  }, [propertyInfo.blur]);

  // Handle opacity
  useEffect(() => {
    if (typeof propertyInfo.blurTrans === "number") {
      const trans = Math.floor(2.55 * propertyInfo.blurTrans as number).toString(16);
      updateProperty("blurTrans", trans);
    }
  }, [propertyInfo.blurTrans]);

  // Download image
  const downloadImage = (format: string) => {
    if (onDownload) {
      onDownload(format);
    }
  };

  // Update these methods to support multiple SVG templates
  const randomizeSvgParams = (index: number) => {
    if (index >= 0 && index < SVG_BACKGROUNDS.length) {
      const svgTemplate = SVG_BACKGROUNDS[index];
      const params = {...svgTemplate.defaultParams};
      
      // Random parameter settings...
      // This part is implemented in RightPropertyPanel
      
      setSvgPatternParams(params);
      setSelectedSvgIndex(index);
      
      const svgPattern = svgTemplate.svgTemplate(params);
      const encodedSvg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svgPattern)}")`;
      setBackgroundPattern(encodedSvg);
      setBackgroundType('svg');
    }
  };

  // Just make sure to keep Heazy wave related random generation logic
  const randomizeHeazyWave = () => {
    // Confirm it's Heazy wave (index 1)
    const heazyWaveIndex = 1;
    const heazyWave = SVG_BACKGROUNDS[heazyWaveIndex];
    
    // Create new params object, keep default value structure
    const params = {...heazyWave.defaultParams};
    
    // Random color - generate vibrant color
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 40 + Math.floor(Math.random() * 140)) % 360;
    
    params.color1 = `hsl(${hue1}, 80%, 60%)`;
    params.color2 = `hsl(${hue2}, 80%, 60%)`;
    
    // Randomly set parameters
    params.amplitude = Math.floor(Math.random() * 95) + 10; // 10-105
    params.frequency = (Math.random() * 0.045) + 0.005; // 0.005-0.05
    params.layers = Math.floor(Math.random() * 5) + 1; // 1-5
    params.speed = (Math.random() * 0.8) + 0.1; // 0.1-0.9
    params.rotation = Math.floor(Math.random() * 360 / 15) * 15; // 0-345，每15度一个增量
    params.contrast = Math.floor(Math.random() * 101); // 0-100
    params.wavesOpacity = (Math.random() * 0.6) + 0.3; // 0.3-0.9
    
    // Randomly select direction
    const directions = ['left', 'right', 'none'];
    params.direction = directions[Math.floor(Math.random() * directions.length)];
    
    // Randomly select style
    params.style = Math.random() > 0.5 ? 'solid' : 'outline';
    
    // Randomly select whether to use gradient background
    params.useGradientBg = Math.random() > 0.3; // 70%概率使用渐变背景
    
    if (!params.useGradientBg) {
      // If not using gradient, randomly generate background color (dark)
      const bgHue = Math.floor(Math.random() * 360);
      params.backgroundColor = `hsl(${bgHue}, 70%, 10%)`;
    }
    
    // Update state
    setSvgPatternParams(params);
    setSelectedSvgIndex(heazyWaveIndex);
    
    // Generate SVG
    const svgPattern = heazyWave.svgTemplate(params);
    const encodedSvg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svgPattern)}")`;
    setBackgroundPattern(encodedSvg);
    setBackgroundType('svg');
  };

  return (
    <ConvImgContext.Provider 
      value={{ 
        imageInfo, 
        setImageInfo, 
        propertyInfo, 
        updateProperty,
        downloadImage,
        backgroundType,
        setBackgroundType: handleBackgroundTypeChange,
        backgroundColor,
        setBackgroundColor,
        backgroundPattern,
        setBackgroundPattern,
        selectedSvgIndex,
        setSelectedSvgIndex,
        svgPatternParams,
        setSvgPatternParams,
        showSvgPanel,
        setShowSvgPanel,
        elementsLayout,
        setElementsLayout,
      }}
    >
      {children}
    </ConvImgContext.Provider>
  );
}

// Custom Hook for accessing Context
export function useConvImg() {
  const context = useContext(ConvImgContext);
  if (context === undefined) {
    throw new Error("useConvImg must be used within a ConvImgProvider");
  }
  return context;
} 