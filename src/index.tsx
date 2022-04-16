import { connect, Field, FieldIntentCtx, RenderFieldExtensionCtx,RenderModalCtx } from 'datocms-plugin-sdk';
import { render } from './utils/render';
import ConfigScreen from './entrypoints/ConfigScreen';
import ImageColorSelector from './entrypoints/ImageColorSelector';
import 'datocms-react-ui/styles.css';
import ColorPickerModal from './entrypoints/ColorPickerModal';

const isDev = document.location.hostname === 'localhost';

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  manualFieldExtensions() {
    return [
      {
        id: 'imageColorSelector',
        name: 'Image Color Selector' + (isDev ? ' (dev)' : ''),
        type: 'addon',
        fieldTypes: ['file'],
      },
    ];
  },
  renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
    return render(<ImageColorSelector ctx={ctx} />);
  },
  renderModal(modalId: string, ctx: RenderModalCtx) {
    switch (modalId) {
      case 'colorPickerModal':
        return render(<ColorPickerModal ctx={ctx} />);
    }
  },
  async onBoot(ctx) {
    console.log(`${require('../package.json').name} v${require('../package.json').version}`);
  }
});
