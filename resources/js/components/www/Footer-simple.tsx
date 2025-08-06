import * as React from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  Github,
  Youtube,
} from 'lucide-react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  IconButton,
  Divider,
} from '@mui/material';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'X', icon: Twitter, href: '#' },
  { name: 'GitHub', icon: Github, href: '#' },
  { name: 'YouTube', icon: Youtube, href: '#' },
];

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
      {'Copyright © '}
      <Link color="text.secondary" href="https://mui.com/">
        Your Company
      </Link>{' '}
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function FooterSimple() {
  return (
    <Container
      component="footer"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 4, sm: 8 },
        py: { xs: 4, sm: 4 },
        textAlign: { sm: 'center', md: 'left' },
      }}
    >

      {/* Footer inferior */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          pt: { xs: 4, sm: 4 },
          width: '100%',
          alignItems:'center',
          gap:{ xs: 2, sm: 0 },
        }}
      >
        <Box
          sx={{
            display: { xs: 'row', sm: 'flex' },
            width: { xs: '100%', sm: '60%' },
            textAlign: { xs: 'center', sm: 'left' },
            alignItems:'center',
          }}
        >
          <Box
            component="img"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            alt="Company Logo"
            sx={{
              height: 40,
              mx: { xs: 'auto', sm: 0 },
              display: 'block',
            }}
          />
          <Copyright />
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: 'left', color: 'text.secondary' }}
        >
          {socialLinks.map(({ name, icon: Icon, href }) => (
            <IconButton
              key={name}
              color="inherit"
              size="small"
              href={href}
              aria-label={name}
              sx={{ alignSelf: 'center' }}
            >
              <Icon size={20} strokeWidth={1.5} />
            </IconButton>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}
