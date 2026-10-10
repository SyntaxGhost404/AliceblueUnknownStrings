import React from 'react';
import CustomText, { CustomTextProps } from './CustomText';

type Props = CustomTextProps & { text: string; highlightColor?: string };

/**
 * Text with lightweight inline markup: `*name*` is set in the semibold face (status lines)
 * and `^word^` switches to the handwritten face with an optional highlight colour.
 */
export default function SmartText(props: Props) {
  const { text } = props;
  if (text.includes('^')) {
    return (
      <CustomText {...props} text="">
        {text.split('^').map((part, index) => (
          <CustomText
            {...props}
            key={index}
            text={part}
            color={index % 2 === 1 ? props.highlightColor ?? props.color : props.color}
            style={{ fontFamily: index % 2 === 1 ? 'Caveat-Bold' : 'Caveat-Regular' }}
          />
        ))}
      </CustomText>
    );
  }
  if (text.includes('*')) {
    return (
      <CustomText {...props} text="">
        {text.split('*').map((part, index) => (
          <CustomText
            {...props}
            key={index}
            text={part}
            style={{ fontFamily: index % 2 === 1 ? 'Quicksand-SemiBold' : 'Quicksand-Regular' }}
          />
        ))}
      </CustomText>
    );
  }
  return <CustomText {...props} />;
}
