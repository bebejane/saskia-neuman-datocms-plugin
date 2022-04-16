import styles from './ImageColorSelector.module.css'
import { useEffect, useState } from 'react'
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas, Spinner, TextField } from 'datocms-react-ui';
import hexRgb from 'hex-rgb';
import rgbHex from 'rgb-hex';

const { SiteClient } =  require('datocms-client')

type PropTypes = { ctx: RenderFieldExtensionCtx };
type Color = { red:number, green:number, blue:number, alpha:number }


export default function ImageColorSelector({ ctx } : PropTypes) {
  
  const fieldKey = ctx.field.attributes.api_key;
  const formValues = ctx.formValues as any;
  const uploadId = formValues[fieldKey]?.upload_id
  
  const [colors, setColors] = useState<[Color]>();
  const [loading, setLoading] = useState(true);
  const [hexColor, setHexColor] = useState<string>();
  const [selected, setSelected] = useState<Color>();

  const saveColorSelection = async (color:Color) => {
    const customData = {selectedColor:`${color.red},${color.green},${color.blue}`}
    try{
      const client = new SiteClient(ctx.currentUserAccessToken)
      await client.uploads.update(uploadId, {
        defaultFieldMetadata: {
          en: {
            alt:'',
            title:'',
            customData
          },
        },
      })
      console.log('saved color', customData)
    }catch(err){
      console.log(err)
    }
  }

  const loadImageData = async () => {
    try{
      console.log(ctx)
      console.log(ctx.currentUserAccessToken)
      const client = new SiteClient(ctx.currentUserAccessToken)
      const image = await client.uploads.find(uploadId)
      const selectedColor = image?.defaultFieldMetadata.en?.customData.selectedColor;
    
      if(selectedColor){
        const rgb = selectedColor.split(',').map((c:string) => parseInt(c))
        setSelected({red:rgb[0],green:rgb[1],blue:rgb[2],alpha:255})
      }
      setColors(image?.colors)
    }catch(err){
      console.log(err)
    }
    setLoading(false)
  }

  const isSelected = (color:Color, color2?:Color) =>{  
    if(!color || !color2) return false
    return color.red === color2.red && color.green === color2.green && color.blue === color2.blue
  }

  useEffect(()=>{ uploadId ? loadImageData() : setColors(undefined)}, [uploadId])
  useEffect(()=>{ if(selected) setHexColor(`#${rgbHex(selected.red, selected.green, selected.blue)}`)}, [selected])
  useEffect(()=>{ 
    if(!hexColor) return
    try{
      const color = hexRgb(hexColor);
      saveColorSelection(color);
    }catch(err){
      console.log('not a valid color', hexColor)
    }
  }, [hexColor])
  
  return (
    <Canvas ctx={ctx}>
      <main>
        {loading && <Spinner size={14}/>}
        {colors &&
          <>
            <div className={styles.container}>
              <div className={styles.palette}>
                {colors.map((color, idx) => 
                  <div 
                    key={idx}
                    className={`${styles.color} ${isSelected(color, selected) && styles.selected}`} 
                    onClick={()=>setSelected(color)}
                  >
                    <div 
                      className={styles.colorBox} 
                      style={{backgroundColor:`rgba(${color.red},${color.green},${color.blue},${color.alpha})`}}
                    ></div>
                  </div>
                )}
              </div>
              <div className={styles.custom}>
                <input 
                  id={'hexcolor'} 
                  className={styles.hex} 
                  value={hexColor}
                  maxLength={7}
                  placeholder="#ccaabb"
                  onKeyDown={()=>setSelected(undefined)}
                  onChange={(e)=> setHexColor(e.target.value)} type="text" 
                />
                <div className={`${styles.color} ${!selected && styles.selected}`}>
                  <div 
                    className={styles.colorBox} 
                    style={!selected ? {backgroundColor:hexColor} : {}}
                  ></div>
                </div>
              </div>
            </div>
          </>
        }
      </main>
    </Canvas>
  );
}