import type { Schema, Struct } from '@strapi/strapi';

export interface BlogBlock extends Struct.ComponentSchema {
  collectionName: 'components_blog_blocks';
  info: {
    displayName: 'block';
    icon: 'file';
  };
  attributes: {};
}

export interface BlogButton extends Struct.ComponentSchema {
  collectionName: 'components_blog_buttons';
  info: {
    displayName: 'button';
  };
  attributes: {
    button_style: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
    button_text: Schema.Attribute.String;
    button_url: Schema.Attribute.String;
  };
}

export interface BlogCode extends Struct.ComponentSchema {
  collectionName: 'components_blog_codes';
  info: {
    displayName: 'code';
  };
  attributes: {
    code_content: Schema.Attribute.Text;
    code_language: Schema.Attribute.String;
  };
}

export interface BlogGallery extends Struct.ComponentSchema {
  collectionName: 'components_blog_galleries';
  info: {
    displayName: 'gallery';
  };
  attributes: {
    gallery_images: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
  };
}

export interface BlogHeading extends Struct.ComponentSchema {
  collectionName: 'components_blog_headings';
  info: {
    displayName: 'heading';
  };
  attributes: {
    heading_level: Schema.Attribute.Enumeration<['h2', 'h3', 'h4']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'h2'>;
    text: Schema.Attribute.String;
  };
}

export interface BlogImage extends Struct.ComponentSchema {
  collectionName: 'components_blog_images';
  info: {
    displayName: 'image';
    icon: 'picture';
  };
  attributes: {
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    image_position: Schema.Attribute.Enumeration<
      ['left', 'center', 'right', 'full']
    > &
      Schema.Attribute.DefaultTo<'full'>;
  };
}

export interface BlogQuote extends Struct.ComponentSchema {
  collectionName: 'components_blog_quotes';
  info: {
    displayName: 'quote';
  };
  attributes: {
    quote_author: Schema.Attribute.String;
    quote_text: Schema.Attribute.Text;
  };
}

export interface BlogText extends Struct.ComponentSchema {
  collectionName: 'components_blog_texts';
  info: {
    displayName: 'text';
  };
  attributes: {
    text: Schema.Attribute.Text;
  };
}

export interface BlogVideo extends Struct.ComponentSchema {
  collectionName: 'components_blog_videos';
  info: {
    displayName: 'video';
  };
  attributes: {
    video_url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'blog.block': BlogBlock;
      'blog.button': BlogButton;
      'blog.code': BlogCode;
      'blog.gallery': BlogGallery;
      'blog.heading': BlogHeading;
      'blog.image': BlogImage;
      'blog.quote': BlogQuote;
      'blog.text': BlogText;
      'blog.video': BlogVideo;
    }
  }
}
