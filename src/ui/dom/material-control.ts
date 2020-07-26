import { Material } from "../../core/material";
import { Vector3 } from "../../math";

type OnColorChanged = (color: Vector3) => void;
type OnValueChanged = (value: number) => void;

class ValueOptions {
  min: number = 0.0;
  max: number = 1.0;
  step: number = 0.001;
}

function create_slider_component(name: string, value: number, onValueChanged?: OnValueChanged, options: ValueOptions = new ValueOptions()): HTMLDivElement {
  const slider_container = document.createElement('div');
  slider_container.className = 'control-slider-container';

  const onSliderMove = () => {
    const value = parseFloat(slider.value);
    input.value = value.toFixed(2);
    if (onValueChanged) onValueChanged(value);
  }

  const onSliderEnd = () => {
    window.removeEventListener('mouseup', onSliderEnd, false);
    window.removeEventListener('mousemove', onSliderMove,  false);
  }

  const label = document.createElement('p');
  label.className = 'control-slider-label';
  label.innerHTML = name;
  slider_container.appendChild(label);

  const slider = document.createElement('input');
  slider.className = 'control-slider';
  slider.type = 'range';
  slider.min = options.min.toString();
  slider.max = options.max.toString();
  slider.step = options.step.toString();
  slider.value = value.toFixed(2).toString();
  slider.addEventListener('mousedown', () => {
    window.addEventListener('mousemove', onSliderMove, false);
    window.addEventListener('mouseup', onSliderEnd, false);
  }, false);
  slider_container.appendChild(slider);

  const input = document.createElement('input');
  input.className = 'control-slider-input';
  input.type = 'value';
  input.value = value.toFixed(2).toString();
  input.addEventListener('keyup', (event: KeyboardEvent) => {
    if (event.keyCode === 13) {
      const value = parseFloat(input.value);
      slider.value = value.toFixed(2);
      if (onValueChanged) onValueChanged(value);
    }
  }, false);
  slider_container.appendChild(input);

  return slider_container;
}

function create_color_control(name: string, color: Vector3, onColorChanged?: OnColorChanged): HTMLDivElement {
  let opened = false;

  const tab = document.createElement('div');
  tab.className = 'control-tab';

  const title = document.createElement('p');
  title.className = 'control-title';
  title.innerHTML = name;
  tab.appendChild(title);

  const toggle = document.createElement('div');
  toggle.className = 'control-toggle';
  toggle.onclick = () => {
    detail.style.height = opened ? '0' : '96px';
    tab.style.height = opened ? '0' : '128px';
    opened = !opened;
  }
  toggle.title = `${name} toggle`;
  tab.appendChild(toggle);

  const detail = document.createElement('div');
  detail.className = 'control-detail';
  tab.appendChild(detail);

  const slider_r = create_slider_component('R', color.x, (value: number) => { color.x = value; });
  const slider_g = create_slider_component('G', color.y, (value: number) => { color.y = value; });
  const slider_b = create_slider_component('B', color.z, (value: number) => { color.z = value; });

  detail.appendChild(slider_r);
  detail.appendChild(slider_g);
  detail.appendChild(slider_b);

  return tab;
}

function create_value_control(name: string, value: number, onValueChanged?: OnValueChanged, options: ValueOptions = new ValueOptions()): HTMLDivElement {
  let opened = false;

  const tab = document.createElement('div');
  tab.className = 'control-tab';

  const title = document.createElement('p');
  title.className = 'control-title';
  title.innerHTML = name;
  tab.appendChild(title);

  const toggle = document.createElement('div');
  toggle.className = 'control-toggle';
  toggle.onclick = () => {
    detail.style.height = opened ? '0' : '32px';
    tab.style.height = opened ? '0' : '64px';
    opened = !opened;
  }
  toggle.title = `${name} toggle`;
  tab.appendChild(toggle);

  const detail = document.createElement('div');
  detail.className = 'control-detail';
  tab.appendChild(detail);

  const slider = create_slider_component(name, value,onValueChanged, options);
  detail.appendChild(slider);

  return tab;
}

export class MaterialControl {

  constructor(public container: HTMLDivElement) {}

  control(material: Material): void {
    this.container.appendChild(create_color_control('albedo', material.emission));
    this.container.appendChild(create_value_control('metallic', material.metallic, (value: number) => { material.metallic = value; material.needsUpdate = true; }));
    this.container.appendChild(create_value_control('specular', material.specular, (value: number) => { material.specular = value; material.needsUpdate = true; }));
    this.container.appendChild(create_value_control('roughness', material.roughness, (value: number) => { material.roughness = value; material.needsUpdate = true; }));
    this.container.appendChild(create_color_control('emission', material.emission));
    this.container.appendChild(create_value_control('transmission', material.transmission, (value: number) => { material.transmission = value; material.needsUpdate = true; }));
    this.container.appendChild(create_color_control('absorption', material.absorption));
  }

  release(): void {
    this.container.innerHTML = '';
  }

}