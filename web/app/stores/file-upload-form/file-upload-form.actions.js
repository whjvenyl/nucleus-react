import * as constants from './file-upload-form.constants';

const set = (formData) => (dispatch) => {
  dispatch({
    type: constants.SET,
    formData
  });
};

const reset = () => ({
  type: constants.RESET,
});

export default {
  set,
  reset
};
