/*
    *Initial State*
    {
        loading: false,
        error: false,
        success: true
    }
*/

export const marketDappyReducer = (state, action) => {
    switch (action.type) {
      case "LOADING":
        return {
          ...state,
          loading: true,
          error: false,
          success: false
        };
      case "ERROR":
        return {
          ...state,
          loading: false,
          error: true,
          success: false
        };
      case "SUCCESS":
        return {
          ...state,
          loading: false,
          error: false,
          success: true,
        };
      default:
        throw new Error();
    }
  };
  