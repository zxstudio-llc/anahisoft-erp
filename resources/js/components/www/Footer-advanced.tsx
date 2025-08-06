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

export default function FooterAdvanced() {
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo y descripción */}
        <Box
          sx={{
            width: { xs: '100%', sm: '60%' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Box
            component="img"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            alt="Company Logo"
            sx={{
              height: 48,
              mx: { xs: 'auto', sm: 0 }, // centra en xs, alinea a la izquierda en sm+
              display: 'block',
            }}
          />
          <Typography
            variant="body2"
            gutterBottom
            sx={{ fontWeight: 600, mt: 2 }}
          >
            Subscribe for weekly updates. No spams ever!
          </Typography>
        </Box>

      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'row' },
          width: '100%',
          justifyContent: 'space-between',
        }}
      >

        {/* Enlaces */}
        {[
          {
            title: 'Solutions',
            links: ['Marketing', 'Analytics', 'Automation', 'Commerce', 'Insights'],
          },
          {
            title: 'Support',
            links: ['Submit ticket', 'Documentation', 'Guides'],
          },
          {
            title: 'Company',
            links: ['About', 'Blog', 'Jobs', 'Press'],
          },
          {
            title: 'Legal',
            links: ['Terms of service', 'Privacy policy', 'License'],
          },
        ].map((section) => (
          <Box
            key={section.title}
            sx={{
              display: { xs: 'flex', sm: 'flex' },
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {section.title}
            </Typography>
            {section.links.map((link) => (
              <Link
                key={link}
                href="#"
                color="text.secondary"
                variant="body2"
                underline="none"
              >
                {link}
              </Link>
            ))}
          </Box>
        ))}
      </Box>

      {/* Footer inferior */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          pt: { xs: 4, sm: 4 },
          width: '100%',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <div>
          <Copyright />
        </div>

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
