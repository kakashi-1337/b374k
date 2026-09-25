// Mantine styles
// Component style overrides

export default {
  Text: {
    styles: (theme) => ({
      root: {
        color: theme.other[theme.colorScheme].text
      }
    })
  },
  Button: {
    styles: (theme, { variant }) => {
      let styles = {}

      if (variant === 'light') {
        styles = {
          background: theme.other[theme.colorScheme].lightBgColor,
          color:
            theme.colorScheme === 'light'
              ? theme.colors.brand[6]
              : theme.other[theme.colorScheme].text,
          ':hover': {
            backgroundColor:
              theme.colorScheme === 'light'
                ? theme.colors.brand[1]
                : theme.colors.dark[7]
          }
        }
      } else if (variant === 'default') {
        styles = {
          border: 'none'
        }
      } else if (variant === 'outline') {
        styles = {
          borderColor:
            theme.colorScheme === 'light'
              ? theme.colors.brand[6]
              : theme.colors.brand[2],
          color:
            theme.colorScheme === 'light'
              ? theme.colors.brand[6]
              : theme.colors.brand[2]
        }
      } else if (variant === 'subtle') {
        styles = {
          ':disabled': {
            backgroundColor: 'transparent !important'
          }
        }
      } else if (variant === 'transparent') {
        styles = {
          ':active': {
            opacity: 0.6
          }
        }
      }

      return {
        root: {
          fontWeight: 600,
          div: {
            fontSize: theme.fontSizes.lg
          },
          ...styles
        }
      }
    }
  },
  Image: {
    styles: () => ({
      root: {
        imageRendering: '-webkit-optimize-contrast'
      }
    })
  },
  ThemeIcon: {
    styles: (theme) => ({
      root: {
        background: 'transparent',
        color: theme.other[theme.colorScheme].text,
        svg: {
          strokeWidth: 1.5
        }
      }
    })
  },
  Title: {
    styles: (theme) => ({
      root: {
        color: theme.other[theme.colorScheme].text
      }
    })
  },
  Paper: {
    styles: (theme) => ({
      root: {
        backgroundColor: theme.other[theme.colorScheme].cardBgColor
      }
    })
  },
  AppShell: {
    styles: (theme) => ({
      root: {
        main: {
          backgroundColor: theme.other[theme.colorScheme].backgroundColor
        }
      }
    })
  },
  Divider: {
    styles: (theme) => ({
      root: {
        borderColor: `${theme.other[theme.colorScheme].outline} !important`
      }
    })
  },
  Switch: {
    styles: (theme) => ({
      root: {
        div: {
          fontWeight: 500,
          color: theme.other[theme.colorScheme].text,
          ':hover': {
            cursor: 'pointer'
          }
        }
      }
    })
  },
  TextInput: {
    styles: (theme) => ({
      root: {
        input: {
          color: theme.other[theme.colorScheme].text,
          backgroundColor: 'transparent'
        },
        label: {
          fontWeight: 600
        }
      }
    })
  },
  FileInput: {
    styles: () => ({
      root: {
        button: {
          backgroundColor: 'transparent'
        },
        label: {
          fontWeight: 700
        }
      }
    })
  },
  Textarea: {
    styles: () => ({
      root: {
        textarea: {
          backgroundColor: 'transparent'
        }
      }
    })
  },
  PasswordInput: {
    styles: (theme) => ({
      root: {
        div: {
          div: {
            backgroundColor: 'transparent',
            input: {
              color: theme.other[theme.colorScheme].text
            }
          }
        }
      },
      label: {
        fontWeight: 600,
        color: theme.other[theme.colorScheme].text
      }
    })
  },
  Select: {
    styles: (theme) => ({
      root: {
        input: {
          backgroundColor: 'transparent',
          color: theme.other[theme.colorScheme].text
        },
        label: {
          fontWeight: 600
        }
      }
    })
  },
  NativeSelect: {
    styles: () => ({
      root: {
        select: {
          backgroundColor: 'transparent'
        },
        label: {
          fontWeight: 600
        }
      }
    })
  },
  Checkbox: {
    styles: (theme) => ({
      root: {
        input: {
          borderRadius: theme.radius.xs
        }
      }
    })
  },
  Modal: {
    styles: (theme) => ({
      root: {
        zIndex: 999
      },
      modal: {
        boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)',
        borderRadius: theme.radius.lg,
        backgroundColor: theme.other[theme.colorScheme].cardBgColor
      },
      title: {
        fontSize: theme.fontSizes.lg,
        fontWeight: 600
      },
      close: {
        svg: {
          width: 20,
          height: 20
        }
      }
    })
  },
  Table: {
    styles: (theme) => ({
      root: {
        thead: {
          tr: {
            th: {
              border: 'none'
            }
          }
        },
        tbody: {
          tr: {
            td: {
              border: 'none',
              fontSize: theme.fontSizes.md,
              color: theme.other[theme.colorScheme].text
            }
          }
        }
      }
    })
  },
  ActionIcon: {
    styles: (theme) => ({
      root: {
        color: theme.other[theme.colorScheme].text,
        ':active': {
          opacity: 0.6
        }
      }
    })
  },
  Tabs: {
    styles: (theme) => ({
      tab: {
        padding: theme.spacing.sm,
        fontSize: theme.fontSizes.md,
        color: `${theme.other[theme.colorScheme].text} !important`,
        fontWeight: 500
      }
    })
  },
  CloseButton: {
    styles: (theme) => ({
      color: theme.other[theme.colorScheme].text,
      svg: {
        color: theme.other[theme.colorScheme].text
      },
      root: {
        svg: {
          color: theme.other[theme.colorScheme].text
        }
      },
      button: {
        svg: {
          color: theme.other[theme.colorScheme].text
        }
      }
    })
  },
  Pagination: {
    styles: (theme) => ({
      item: {
        border: 'none',
        backgroundColor: theme.other[theme.colorScheme].backgroundColor,
        borderRadius: theme.radius.xs
      }
    })
  },
  Skeleton: {
    styles: (theme) => ({
      root: {
        ':before': {
          background: `${
            theme.other[theme.colorScheme].backgroundColor
          } !important`
        },
        ':after': {
          background: `${theme.other[theme.colorScheme].borderColor} !important`
        }
      }
    })
  },
  DatePicker: {
    styles: (theme) => ({
      root: {
        input: {
          backgroundColor: 'transparent'
        }
      },
      dropdown: {
        border: 'none',
        boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)',
        backgroundColor: theme.other[theme.colorScheme].cardBgColor
      }
    })
  },
  Notification: {
    styles: (theme) => ({
      root: {
        backgroundColor: theme.other[theme.colorScheme].cardBgColor,
        border: 'none',
        boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)',
        padding: theme.spacing.sm
      }
    })
  },
  Dialog: {
    styles: (theme) => ({
      root: {
        backgroundColor: theme.other[theme.colorScheme].cardBgColor,
        border: 'none',
        boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)',
        padding: theme.spacing.sm
      }
    })
  },
  Popover: {
    styles: (theme) => ({
      root: {
        backgroundColor: theme.other[theme.colorScheme].cardBgColor,
        border: 'none',
        boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)'
      },
      dropdown: {
        padding: theme.spacing.md,
        backgroundColor: theme.other[theme.colorScheme].cardBgColor,
        border: 'none',
        boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)'
      }
    })
  },
  Drawer: {
    styles: (theme) => ({
      root: {
        zIndex: 999
      },
      closeButton: {
        color: theme.other[theme.colorScheme].text,
        svg: {
          width: 24,
          height: 24
        }
      }
    })
  },
  Anchor: {
    styles: (theme) => ({
      root: {
        color: theme.other[theme.colorScheme].primary
      }
    })
  },
  Accordion: {
    styles: (theme) => ({
      item: {
        borderRadius: theme.radius.md,
        boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)',
        backgroundColor: `${
          theme.other[theme.colorScheme].cardBgColor
        } !important`
      },
      itemTitle: {
        boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.05)'
      },
      label: {
        fontWeight: 600,
        color: theme.other[theme.colorScheme].text
      },
      control: {
        borderRadius: theme.radius.md,
        backgroundColor: theme.other[theme.colorScheme].cardBgColor
      },
      content: {
        borderRadius: theme.radius.md,
        backgroundColor: theme.other[theme.colorScheme].cardBgColor
      },
      chevron: {
        color: theme.other[theme.colorScheme].text,
        marginRight: theme.spacing.xs,
        svg: {
          width: 24,
          height: 24
        }
      }
    })
  },
  Progress: {
    styles: () => ({
      root: {
        width: '100%'
      }
    })
  }
}
