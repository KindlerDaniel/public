import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * Hook zur Verwaltung einer Three.js-3D-Szene für die Bubble-Visualisierung
 * 
 * @param {Object} options - Konfigurationsoptionen
 * @param {Function} options.onContentSelect - Callback-Funktion, die aufgerufen wird, wenn ein Content-Punkt ausgewählt wird
 * @param {Object} options.filters - Filter für die anzuzeigenden Inhalte
 * @returns {Object} - Three.js-Objekte und Methoden für die Interaktion mit der 3D-Szene
 */
const useThreeJS = ({ 
  onContentSelect = () => {}, 
  filters = { beauty: false, wisdom: false, humor: false, timeRange: 'all' } 
} = {}) => {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const contentPointsRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  // Initialisiere die 3D-Szene
  const initThreeJS = useCallback((container) => {
    if (!container) return;
    
    containerRef.current = container;
    
    // Szene, Kamera und Renderer erstellen
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Kamera positionieren
    camera.position.z = 5;
    
    // Orbit-Steuerungen hinzufügen
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = true;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = false;
    
    // Hauptkugel erstellen
    const sphereGeometry = new THREE.SphereGeometry(2, 64, 64);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x4A90E2,
      transparent: true,
      opacity: 0.7,
      wireframe: false
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    
    // Licht hinzufügen
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Referenzen speichern
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    
    // Event-Listener hinzufügen
    window.addEventListener('resize', handleResize);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);
    
    setIsInitialized(true);
    
    // Starte den Rendering-Loop
    animate();
    
    // Content-Punkte generieren
    generateContentPoints();
    
    return () => {
      // Aufräumen
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameRef.current);
      container.removeChild(renderer.domElement);
    };
  }, []);
  
  // Content-Punkte basierend auf Filtern generieren
  const generateContentPoints = useCallback(() => {
    if (!sceneRef.current) return;
    
    // Entferne bestehende Punkte
    contentPointsRef.current.forEach(point => {
      sceneRef.current.remove(point.mesh);
    });
    contentPointsRef.current = [];
    
    // Generiere neue Punkte basierend auf Filtern
    // In einer echten Implementierung würden wir Daten aus einer API laden
    const numberOfPoints = 50;
    const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    
    for (let i = 0; i < numberOfPoints; i++) {
      // Zufällige Position auf der Kugeloberfläche
      const phi = Math.acos(-1 + (2 * i) / numberOfPoints);
      const theta = Math.sqrt(numberOfPoints * Math.PI) * phi;
      
      const x = 2 * Math.sin(phi) * Math.cos(theta);
      const y = 2 * Math.sin(phi) * Math.sin(theta);
      const z = 2 * Math.cos(phi);
      
      // Erstelle Mock-Content mit zufälligen Bewertungen
      const contentId = `content-${i}`;
      const ratings = {
        beauty: Math.floor(Math.random() * 100),
        wisdom: Math.floor(Math.random() * 100),
        humor: Math.floor(Math.random() * 100)
      };
      
      // Überprüfe, ob der Inhalt die Filter erfüllt
      let passesFilter = true;
      if (filters.beauty && ratings.beauty < 50) passesFilter = false;
      if (filters.wisdom && ratings.wisdom < 50) passesFilter = false;
      if (filters.humor && ratings.humor < 50) passesFilter = false;
      
      // Füge nur passende Punkte hinzu
      if (passesFilter) {
        // Farbe basierend auf Dominanz der Bewertung
        let color;
        if (ratings.beauty > ratings.wisdom && ratings.beauty > ratings.humor) {
          color = 0xFF5252; // Rot für Beauty
        } else if (ratings.wisdom > ratings.beauty && ratings.wisdom > ratings.humor) {
          color = 0x4CAF50; // Grün für Wisdom
        } else {
          color = 0xFFEB3B; // Gelb für Humor
        }
        
        const pointMaterial = new THREE.MeshBasicMaterial({ color });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        
        point.position.set(x, y, z);
        point.userData = { contentId, ratings };
        
        sceneRef.current.add(point);
        contentPointsRef.current.push({
          mesh: point,
          contentId,
          ratings
        });
      }
    }
  }, [filters]);
  
  // Event-Handler für Resize-Events
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    
    rendererRef.current.setSize(width, height);
  }, []);
  
  // Event-Handler für Mausbewegungen
  const handleMouseMove = useCallback((event) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    mouseRef.current.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
  }, []);
  
  // Event-Handler für Klick-Events
  const handleClick = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !raycasterRef.current) return;
    
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const intersects = raycasterRef.current.intersectObjects(
      contentPointsRef.current.map(point => point.mesh)
    );
    
    if (intersects.length > 0) {
      const selectedPoint = intersects[0].object;
      const contentId = selectedPoint.userData.contentId;
      
      // Content-Callback auslösen
      onContentSelect(contentId);
    }
  }, [onContentSelect]);
  
  // Animation-Loop
  const animate = useCallback(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !controlsRef.current) {
      return;
    }
    
    // Update controls
    controlsRef.current.update();
    
    // Update raycaster für Hover-Effekte
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const intersects = raycasterRef.current.intersectObjects(
      contentPointsRef.current.map(point => point.mesh)
    );
    
    // Reset vorheriges Hover
    if (hoveredPoint && (!intersects.length || intersects[0].object !== hoveredPoint)) {
      hoveredPoint.scale.set(1, 1, 1);
      setHoveredPoint(null);
      document.body.style.cursor = 'default';
    }
    
    // Setze neues Hover
    if (intersects.length > 0) {
      const hovered = intersects[0].object;
      hovered.scale.set(1.5, 1.5, 1.5);
      setHoveredPoint(hovered);
      document.body.style.cursor = 'pointer';
    }
    
    // Render-Szene
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [hoveredPoint]);
  
  // Rotation ein-/ausschalten
  const toggleRotation = useCallback(() => {
    if (!controlsRef.current) return;
    
    controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
    setIsRotating(controlsRef.current.autoRotate);
  }, []);
  
  // Hook-Effekte
  
  // Effekt zum Aktualisieren der Content-Punkte, wenn sich Filter ändern
  useEffect(() => {
    if (isInitialized) {
      generateContentPoints();
    }
  }, [isInitialized, filters, generateContentPoints]);
  
  return {
    initThreeJS,
    containerRef,
    isRotating,
    toggleRotation
  };
};

export default useThreeJS;