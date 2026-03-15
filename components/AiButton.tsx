'use client'

import * as React from 'react'
import { styled, keyframes } from '@mui/material/styles'
import Button, { ButtonProps } from '@mui/material/Button'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const AnimatedIcon = styled(AutoAwesomeIcon)({
  animation: `${pulse} 2s infinite ease-in-out`,
})

export const AiButton = styled((props: ButtonProps) => (
  <Button
    variant="contained"
    startIcon={<AnimatedIcon />}
    {...props}
  />
))({
  background: 'linear-gradient(270deg, #e97800, #e99031, #faba76, #ffdfbc)',
  backgroundSize: '300% 300%',
  animation: `${gradientShift} 8s ease infinite`,
  color: '#fff',
  fontWeight: 600,
  borderRadius: 12,
  padding: '10px 24px',
  textTransform: 'none',
  boxShadow: '0 4px 14px rgba(185, 110, 10, 0.39)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(214, 124, 6, 0.5)',
  },
})