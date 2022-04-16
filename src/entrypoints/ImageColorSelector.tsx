import styles from './ImageColorSelector.module.css'
import { useEffect, useState } from 'react'
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas, Spinner, TextField } from 'datocms-react-ui';
import hexRgb from 'hex-rgb';
import rgbHex from 'rgb-hex';

const { SiteClient } =  require('datocms-client')

type PropTypes = { ctx: RenderFieldExtensionCtx };
type Color = { red:number, green:number, blue:number }


export default function ImageColorSelector({ ctx } : PropTypes) {
  
  const id = ctx.item?.id as string
  const itemType = ctx.itemType?.id
  const fieldKey = ctx.field.attributes.api_key;
  const formValues = ctx.formValues as any;
  const uploadId = formValues[fieldKey]?.upload_id
  const [colors, setColors] = useState<[Color]>();
  const [loading, setLoading] = useState(true);
  const [hexColor, setHexColor] = useState<string>();
  const [selected, setSelected] = useState<Color>();
  //const [uploadId, setUploadId] = useState<string>();
  
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
    const client = new SiteClient(ctx.currentUserAccessToken)
    //const record = (await client.items.all({itemType,filter:{ids:id}}))[0]
    //console.log(record)
    //if(!record || !record.image) return setLoading(false)

    //const uploadId = record.image.uploadId;
    const image = await client.uploads.find(uploadId)
    //console.log(image)
    setColors(image?.colors)
    //setUploadId(uploadId);
    setLoading(false)
  }
  
  useEffect(()=>{ 
    if(uploadId) 
      loadImageData()
    else
      setColors(undefined)
  }, [uploadId])
  useEffect(()=>{ 
    if(!hexColor) return
    try{
      const color = hexRgb(hexColor);
      saveColorSelection(color);
    }catch(err){
      console.log('not a valid color', hexColor)
    }
  }, [hexColor])

  useEffect(()=>{ 
    if(selected) 
      setHexColor(`#${rgbHex(selected.red, selected.green, selected.blue)}`)
  }, [selected])
  
  return (
    <Canvas ctx={ctx}>
      <main>
        {loading && <Spinner size={14}/>}
        {colors &&
          <>
            <div className={styles.container}>
              {colors.map((color, idx) => 
                <div 
                  className={`${styles.color} ${JSON.stringify(color) === JSON.stringify(selected) && styles.selected}`} 
                  style={{backgroundColor:`rgb(${color.red},${color.green},${color.blue})`}}
                  onClick={()=>setSelected(color)}
                ></div>
              )}
              <input 
                id={'hexcolor'} 
                value={hexColor}
                placeholder="#hex"
                className={styles.hex} 
                onChange={(e)=> setHexColor(e.target.value)} type="text" 
              />
            </div>
          </>
        }
      </main>
    </Canvas>
  );
}