import styles from './ImageColorSelector.module.css'
import { useEffect, useState, useCallback } from 'react'
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas, Spinner, SwitchField } from 'datocms-react-ui';
import hexRgb from 'hex-rgb';
import rgbHex from 'rgb-hex';

const { SiteClient } = require('datocms-client')

type PropTypes = { ctx: RenderFieldExtensionCtx };
type Color = { red: number, green: number, blue: number, alpha: number }

export default function ImageColorSelector({ ctx }: PropTypes) {

  const fieldKey = ctx.field.attributes.api_key;
  const formValues = ctx.formValues as any;
  const uploadId = formValues[fieldKey]?.upload_id

  const [colors, setColors] = useState<[Color]>();
  const [theme, setTheme] = useState<String>('light');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [hexColor, setHexColor] = useState<string>();
  const [selected, setSelected] = useState<Color>();

  const saveCustomData = useCallback(async (color: Color | undefined, theme: String) => {
    const client = new SiteClient(ctx.currentUserAccessToken)
    setSaving(true)
    try {
      const customData = { theme, color: color ? `${color.red},${color.green},${color.blue}` : undefined };
      await client.uploads.update(uploadId, {
        defaultFieldMetadata: {
          en: {
            alt: undefined,
            title: undefined,
            customData
          },
        },
      })
    } catch (err: any) {
      setError(err.message)
    }
    setSaving(false)

  }, [uploadId, ctx.currentUserAccessToken])

  const loadData = async () => {
    setLoading(true)
    try {
      setHexColor(undefined)
      const client = new SiteClient(ctx.currentUserAccessToken)
      const image = await client.uploads.find(uploadId)
      const selectedColor = image?.defaultFieldMetadata.en?.customData.color;
      const selectedTheme = image?.defaultFieldMetadata.en?.customData.theme;

      if (selectedColor) {
        const rgb = selectedColor.split(',').map((c: string) => parseInt(c))
        setSelected({ red: rgb[0], green: rgb[1], blue: rgb[2], alpha: 255 })
      }
      if (selectedTheme)
        setTheme(selectedTheme)

      setColors(image?.colors)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const isSelected = (color: Color, color2?: Color) => {
    if (!color || !color2) return false
    return color.red === color2.red && color.green === color2.green && color.blue === color2.blue
  }

  const isCustomColor = (color: Color | undefined): boolean => {
    if (typeof colors === 'undefined' || typeof color === 'undefined')
      return false

    for (let i = 0; i < colors.length; i++) {
      if (JSON.stringify(colors[i]) === JSON.stringify(color))
        return false;
    }
    return true
  }

  const handleColorPickerModal = async () => {

    const result = await ctx.openModal({
      id: 'colorPickerModal',
      width: 's',
      closeDisabled: false,
      title: 'Custom color',
      parameters: { hex: hexColor },
    });

    if (!result) return

    setSelected(hexRgb(result as string))
    setHexColor(result as string)
  };

  useEffect(() => { uploadId ? loadData() : setColors(undefined) }, [uploadId])
  useEffect(() => { if (selected) setHexColor(`#${rgbHex(selected.red, selected.green, selected.blue)}`) }, [selected])
  useEffect(() => {
    try {
      const color = hexColor ? hexRgb(hexColor) : undefined;
      saveCustomData(color, theme);
    } catch (err) {
      console.log('not a valid customData', hexColor, theme)
    }
  }, [hexColor, theme, saveCustomData])

  return (
    <Canvas ctx={ctx}>
      <main>
        {loading && <Spinner size={20} />}
        {colors &&
          <>
            <div className={styles.container}>
              <div className={styles.theme}>
                <SwitchField
                  id="theme"
                  name="theme"
                  label="White menu"
                  value={theme !== 'light'}
                  onChange={() => {
                    console.log('set theme')
                    setTheme(theme === 'light' ? 'dark' : 'light')
                  }}
                />
                {saving && <Spinner style={{ marginLeft: '1rem' }} size={20} />}
              </div>
              <div className={styles.custom}>
                <div className={styles.palette}>
                  {colors.map((color, idx) =>
                    <div
                      key={idx}
                      className={`${styles.color}`}
                      onClick={() => setSelected(color)}
                    >
                      <div
                        className={`${styles.colorBox} ${isSelected(color, selected) && styles.selected}`}
                        style={{ backgroundColor: `rgba(${color.red},${color.green},${color.blue},${color.alpha})` }}
                      ></div>
                    </div>
                  )}
                </div>
                <input
                  id={'hexcolor'}
                  type="text"
                  className={styles.hex}
                  value={hexColor}
                  maxLength={7}
                  placeholder="#ccaabb"
                  onKeyDown={() => setSelected(undefined)}
                  onChange={(e) => setHexColor(e.target.value)}
                />
                <div className={styles.color}>
                  <div
                    className={`${styles.colorBox} ${(hexColor && isCustomColor(selected)) ? styles.selected : ''}`}
                    style={saving ? {} : { backgroundColor: hexColor }}
                    onClick={handleColorPickerModal}
                    title="Select color"
                  >
                    {saving && <Spinner size={20} />}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.error}>{error}</div>
          </>
        }
      </main>
    </Canvas>
  );
}