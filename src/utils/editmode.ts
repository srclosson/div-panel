import { getDivPanelState } from '../types';

export interface EditModeState {
  prev: boolean;
  curr: boolean;
}

const isEditMode = () =>
  window.location.href.match(/[?&]edit/) !== null || document.getElementById(getDivPanelState().editId) !== null;
class EditModeTracker {
  state: EditModeState;
  constructor() {
    this.state = {
      prev: false,
      curr: isEditMode(),
    };
  }

  update() {
    const curr = isEditMode();
    this.state = {
      prev: this.state.prev !== curr ? this.state.curr : this.state.prev,
      curr: isEditMode(),
    };
    console.log(
      'state updated',
      this.state,
      getDivPanelState().editId,
      document.getElementById(getDivPanelState().editId)
    );
  }

  get(): EditModeState {
    return this.state;
  }
}

const tracker = new EditModeTracker();

export default tracker;
