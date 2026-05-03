import React from 'react';
import { Box, Typography } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface Props {
  points: string[];
}

export default function KeyPoints({ points }: Props) {
  if (!points.length) return null;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
        Key Requirements
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {points.map((point, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <FiberManualRecordIcon sx={{ fontSize: 8, color: 'primary.main', mt: '7px', flexShrink: 0 }} />
            <Typography variant="body2" color="text.primary" lineHeight={1.6}>
              {point}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
