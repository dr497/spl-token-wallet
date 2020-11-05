import React from 'react';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';

const Trading = () => {
  return (
    <>
      <Hidden xsDown>
        <Button
          onClick={() => (window.location.href = 'https://bonfida.com/dex')}
          type="submit"
          color="primary"
          variant="outlined"
          style={{ marginRight: '8px', borderRadius: 0 }}
        >
          Trading
        </Button>
      </Hidden>
    </>
  );
};

export default Trading;
