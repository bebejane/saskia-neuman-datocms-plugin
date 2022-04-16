import { connect, Field, FieldIntentCtx, RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { render } from './utils/render';
import ConfigScreen from './entrypoints/ConfigScreen';
import ImageColorSelector from './entrypoints/ImageColorSelector';
import 'datocms-react-ui/styles.css';

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  manualFieldExtensions() {
    return [
      {
        id: 'imageColorSelector',
        name: 'Image Color Selector',
        type: 'addon',
        fieldTypes: ['file'],
      },
    ];
  },
  renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
    return render(<ImageColorSelector ctx={ctx} />);
  },
  async onBoot(ctx) {
    console.log(`${require('../package.json').name} v${require('../package.json').version}`);
  }
});
