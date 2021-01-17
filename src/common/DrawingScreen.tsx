import React, { useEffect, useRef, useState } from 'react';
import { usePrevious } from '../utils/usePrevious';

interface PropType {
  color?: string;
  width?: number;
  id?: number;
  onChange?: { (dataURL: string): unknown };
  data?: string;

  linesOnly?: boolean;
  canDraw?: boolean;
  colorPicker?: boolean;
  brushPicker?: boolean;
  clearable?: boolean;
  disableTap?: boolean;
}

const clearCanvas = (canvas: HTMLCanvasElement) => {
  canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
};

const writeCanvas = (canvas: HTMLCanvasElement, data: string) => {
  return new Promise<void>((r) => {
    const img = new window.Image();
    img.addEventListener('load', () => {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      r();
    });
    img.setAttribute('src', data);
  });
};
const readCanvas = (canvas: HTMLCanvasElement) => {
  return canvas.toDataURL();
};

const DrawingCanvas = ({ id, color, width, data, onChange, linesOnly, disableTap }: PropType) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPos = useRef({
    prevX: 0,
    prevY: 0,
    startX: 0,
    startY: 0,
    startCanvas: '',
    dragging: false,
    hasMoved: false,
  });
  const prevId = usePrevious(id);

  // new image data received
  useEffect(() => {
    if (!data) return;
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const curImg = canvas.toDataURL();
    if (data === curImg) return;
    writeCanvas(canvas, data);
  }, [data, canvasRef]);

  // command to clear the canvas received
  useEffect(() => {
    if (id === prevId) return;
    if (!id) return;
    const canvas = canvasRef.current;
    if (canvas) {
      clearCanvas(canvas);
      onChange?.(readCanvas(canvas));
    }
  }, [id, prevId, canvasRef, onChange]);

  // any user action to draw on the canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function mouseEvent(res: string, e: MouseEvent | TouchEvent) {
      let { prevX, prevY } = lastPos.current;
      let curX = 0;
      let curY = 0;
      if ((e as any).touches) {
        const touch = (e as TouchEvent).touches[0];
        if (touch) {
          curX = touch.clientX - canvas.offsetLeft + window.scrollX;
          curY = touch.clientY - canvas.offsetTop + window.scrollY;
        } else {
          curX = lastPos.current.prevX;
          curY = lastPos.current.prevY;
        }
      } else {
        const mouse = e as MouseEvent;
        curX = mouse.clientX - canvas.offsetLeft;
        curY = mouse.clientY - canvas.offsetTop;
      }
      lastPos.current.prevX = curX;
      lastPos.current.prevY = curY;

      if (!ctx) return;

      const circle = () => {
        ctx.beginPath();
        ctx.arc(curX, curY, (width || 2) / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = color || 'black';
        ctx.fill();
      };
      const line = () => {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(curX, curY);
        ctx.strokeStyle = color || 'yellow';
        ctx.lineWidth = width || 2;
        ctx.stroke();
        ctx.closePath();
      };

      if (res === 'up' || res === 'out') {
        if (disableTap && !lastPos.current.hasMoved) {
          // do nothing
        } else if (lastPos.current.dragging) {
          if (linesOnly) {
            writeCanvas(canvas, lastPos.current.startCanvas).then(() => {
              prevX = lastPos.current.startX;
              prevY = lastPos.current.startY;
              line();
              onChange?.(readCanvas(canvas));
            });
          } else {
            onChange?.(readCanvas(canvas));
          }
        }
        lastPos.current.dragging = false;
      } else if (res === 'down') {
        lastPos.current.dragging = true;
        lastPos.current.startCanvas = readCanvas(canvas);
        lastPos.current.startX = curX;
        lastPos.current.startY = curY;
        lastPos.current.hasMoved = false;
        if (!disableTap) circle();
      } else if (res === 'move' && lastPos.current.dragging) {
        lastPos.current.hasMoved = true;
        circle();
        line();
      }
    }
    const move = (e: MouseEvent | TouchEvent) => mouseEvent('move', e);
    const down = (e: MouseEvent | TouchEvent) => mouseEvent('down', e);
    const up = (e: MouseEvent | TouchEvent) => mouseEvent('up', e);

    canvas.addEventListener('touchstart', down, false);
    canvas.addEventListener('touchend', up, false);
    canvas.addEventListener('touchmove', move, false);

    canvas.addEventListener('mousemove', move, false);
    canvas.addEventListener('mousedown', down, false);
    canvas.addEventListener('mouseup', up, false);
    canvas.addEventListener('mouseout', up, false);

    return () => {
      canvas.removeEventListener('touchstart', down);
      canvas.removeEventListener('touchend', up);
      canvas.removeEventListener('touchmove', move);

      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mousedown', down);
      canvas.removeEventListener('mouseup', up);
      canvas.removeEventListener('mouseout', up);
    };
  }, [color, width, onChange, canvasRef, lastPos, linesOnly, disableTap]);

  return (
    <canvas
      ref={canvasRef}
      width='400'
      height='400'
      style={{ border: '1px solid black', touchAction: 'none' }}
    ></canvas>
  );
};

export const DrawingScreen = ({
  onChange,
  data,
  linesOnly,
  canDraw,
  colorPicker,
  brushPicker,
  clearable,
  disableTap,
}: PropType) => {
  const [color, setColor] = useState('black');
  const [width, setWidth] = useState(4);
  const [id, setId] = useState(0);
  return (
    <div>
      {canDraw ? (
        <DrawingCanvas
          onChange={onChange}
          color={color}
          width={width}
          id={id}
          data={data}
          linesOnly={linesOnly}
          disableTap={disableTap}
        />
      ) : (
        <img
          width={400}
          height={400}
          alt='Drawing Canvas'
          style={{ border: '1px solid black' }}
          src={data}
        />
      )}
      {colorPicker ? (
        <div style={{ width: 440, margin: '0 auto' }}>
          {[
            '#FFF',
            '#C1C1C1',
            '#EF130B',
            '#FF7100',
            '#FFE400',
            '#00CC00',
            '#00B2FF',
            '#231FD3',
            '#A300BA',
            '#D37CAA',
            '#A0522D',
            '#000',
            '#4C4C4C',
            '#740B07',
            '#C23800',
            '#E8A200',
            '#005510',
            '#00569E',
            '#0E0865',
            '#550069',
            '#A75574',
            '#63300D',
          ].map((c) => (
            <span
              key={c}
              style={{
                padding: 15,
                background: c,
                margin: 4,
                display: 'inline-block',
                border: `${color === c ? 2 : 1}px solid black`,
              }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      ) : null}
      {brushPicker ? (
        <div>
          {[1, 2, 4, 8, 16, 32].map((w) => (
            <span
              key={w}
              style={{
                padding: (40 - w) / 2,
                margin: 4,
                display: 'inline-block',
                border: `${width === w ? 2 : 1}px solid black`,
              }}
              onClick={() => setWidth(w)}
            >
              <div style={{ width: w, height: w, borderRadius: w, background: 'black' }} />
            </span>
          ))}
        </div>
      ) : null}
      {clearable ? (
        <div>
          <span style={{ cursor: 'default' }} onClick={() => setId(id + 1)}>
            clear
          </span>
        </div>
      ) : null}
    </div>
  );
};
