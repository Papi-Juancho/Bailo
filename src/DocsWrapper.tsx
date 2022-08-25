import React, { Fragment, ReactElement, ReactNode, useCallback, useContext, useMemo } from 'react'
import { Box, Container, List, ListItem, ListItemText, styled, Theme } from '@mui/material'
import Link from 'next/link'
import Wrapper from '@/src/Wrapper'
import Copyright from '@/src/Copyright'
import useTheme from '@mui/styles/useTheme'
import { lightTheme } from '@/src/theme'
import { useRouter } from 'next/router'
import DocsMenuContext from '../utils/contexts/docsMenuContext'
import { DocFileOrHeading } from '../types/interfaces'
import isDocHeading from '../utils/isDocHeading'

type Props = {
  children?: ReactNode
}

const paddingIncrement = 2

export default function DocsWrapper({ children }: Props): ReactElement {
  const theme: Theme = useTheme() || lightTheme
  const { pathname } = useRouter()
  const { docsMenuContent, errorMessage } = useContext(DocsMenuContext)

  const StyledList = styled(List)({
    paddingTop: 0,
    paddingBottom: 0,
    '&& .Mui-selected, && .Mui-selected:hover': {
      '&, & .MuiListItemIcon-root': {
        color: theme.palette.secondary.main,
      },
    },
  })

  const createDocElement = useCallback(
    (doc: DocFileOrHeading, paddingLeft = paddingIncrement) => {
      if (isDocHeading(doc)) {
        const childDocElements = doc.children.map((childDoc) =>
          createDocElement(childDoc, paddingLeft + paddingIncrement)
        )
        return (
          <Fragment key={doc.id}>
            <ListItem dense sx={{ pl: paddingLeft }}>
              <ListItemText primary={doc.title} primaryTypographyProps={{ fontWeight: 'bold' }} />
            </ListItem>
            {childDocElements}
          </Fragment>
        )
      }
      return (
        <Link passHref href={`/docs/${doc.slug}`} key={doc.id}>
          <ListItem dense button selected={pathname === `/docs/${doc.slug}`} sx={{ pl: paddingLeft }}>
            <ListItemText primary={doc.title} />
          </ListItem>
        </Link>
      )
    },
    [pathname]
  )

  const docsMenu = useMemo(
    () => docsMenuContent.map((doc) => createDocElement(doc)),
    [docsMenuContent, createDocElement]
  )

  return (
    <Wrapper title='Documentation' page='docs'>
      {/* Banner height + Toolbar height == 96px */}
      <Box display='flex' width='100%' height='calc(100vh - 96px)'>
        {errorMessage ? (
          <Box mx='auto' mt={4}>
            {errorMessage}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                minWidth: 200,
                backgroundColor: '#fff',
                height: '100%',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              }}
            >
              <StyledList>{docsMenu}</StyledList>
            </Box>
            <Box flex={1}>
              <Box display='flex' flexDirection='column' height='100%'>
                <Container maxWidth='lg'>{children}</Container>
                <Copyright sx={{ pb: 2, mt: 'auto' }} />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Wrapper>
  )
}