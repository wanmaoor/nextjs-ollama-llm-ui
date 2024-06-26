import React from 'react';
import {FilePond, registerPlugin} from "react-filepond";
import 'filepond/dist/filepond.min.css'

import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const Uploader: React.FunctionComponent<{children?: React.ReactNode}> = (props) => {
  const [files, setFiles] = React.useState([]);
  return (
    <FilePond
      files={files}
      // @ts-ignore
      onupdatefiles={setFiles}
      allowMultiple={false}
      maxFiles={1}
      server={'/api'}
      name={'files'}
      labelIdle={'请上传图片'}
    >
      {props.children}
    </FilePond>
  )
}

export default Uploader;
