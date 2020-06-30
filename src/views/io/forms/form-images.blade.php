	<div class = 'row d-flex'>
		<div class="col-sm-12 d-flex p-0">
      <div id = "{{ isset($id) ? $id : 'custom-dropzone'}}" class = 'form-group w-100 d-inline-flex align-items-start flex-wrap dropzone dz-drop-files-here {{ isset($class) ? $class : ''}}'>
        <input type = 'hidden' name='{{ isset($hasImages) ? $hasImages : 'hasImages'}}' id="{{ isset($hasImages) ? $hasImages : 'hasImages'}}" value='0' />
      </div>
		</div>
	</div>
