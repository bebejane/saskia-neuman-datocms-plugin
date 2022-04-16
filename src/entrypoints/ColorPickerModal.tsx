import styles from './ColorPickerModal.module.css'
import { useState } from 'react'
import { Canvas, Button } from 'datocms-react-ui';
import { RenderModalCtx } from 'datocms-plugin-sdk';
import hexRgb from 'hex-rgb';
import rgbHex from 'rgb-hex';
import { HexColorPicker } from "react-colorful";

type PropTypes = { ctx:RenderModalCtx };
type Color = { red:number, green:number, blue:number, alpha:number }

export default function ColorPickerModal({ ctx } : PropTypes) {
  const [color, setColor] = useState(ctx.parameters.hex as string)
  const hasChanged = color !== ctx.parameters.hex;

  return (
    <Canvas ctx={ctx}>
      <main className={styles.container}>
        <div className={styles.picker}>
          <HexColorPicker color={color} onChange={setColor} />;
          <div className={styles.box} style={{backgroundColor:color}}>
            {color}
          </div>
        </div>
        <div className={styles.buttons}>
          <Button disabled={!hasChanged} buttonSize="m" onClick={()=> ctx.resolve(color)}>Save</Button> 
        </div>
      </main>
    </Canvas>
  );
}