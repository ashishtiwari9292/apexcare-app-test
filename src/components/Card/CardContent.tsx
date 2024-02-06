import React from 'react';
import { CardContent as MuiCardContent, Collapse } from '@mui/material';
import { ComponentDivProps } from 'typings';

interface CardContentProps extends ComponentDivProps {
  expanded: boolean;
}

export function CardContent({ children, expanded }: CardContentProps): JSX.Element {
  return (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <MuiCardContent>{children}</MuiCardContent>
    </Collapse>
  );
}
