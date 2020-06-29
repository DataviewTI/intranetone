	<div class = 'row d-flex'>
		<div class="col-sm-12 d-flex p-0">
			  <div id = "{{ isset($id) ? $id : 'custom-dropzone'}}" class = 'w-100 d-inline-flex align-items-start flex-wrap dropzone dz-drop-files-here {{ isset($class) ? $class : ''}}'>
        </div>
        <input type = 'hidden' name='has_images' id="has_images" value='0' />
		</div>
	</div>
