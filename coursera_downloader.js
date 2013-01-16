// insert the "Download All Selected" header and textarea

$("div#course-page-content div.course-item-list").before("<br><br><br><h3>Download All Selected</h3>Cut and paste this bash code into the command line. <a href='http://ma-ver-ick.github.com/Coursera-Video-Downloader-Bookmarklet/#select_all' target='_blank'>How?</a><br><textarea id='cmd' rows='5'></textarea><br><br>")

// section selectors
$("div.course-item-list-header").prepend("<a data-placement='left' rel='twipsy' data-original-title='Include chapter in multi-download' style='margin-right:10px'><input type='checkbox' class='multidownload_chapter'></input></a>")

// video selectors
$(".lecture-link").prepend("<a data-placement='left' rel='twipsy' data-original-title='Include in multi-download'><input type='checkbox' class='multidownload'></input></a>")

// check/uncheck individual videos based on viewed status
$(".multidownload").each(function(){
    if($(this).parents("li").hasClass('unviewed'))
        $(this).prop("checked", true);
});


// check/uncheck section based on its videos
function refreshSectionCheckmarks(){
    $(".multidownload_chapter").each(function(){
        var chapterCheckbox = $(this);
        chapterCheckbox.prop("checked", true);

        $(this).parents(".list_header_link").next(".course-item-list-section-list").find(".multidownload").each(function(){
            if(!$(this).attr("checked")){
                chapterCheckbox.prop("checked", false);
                return;
            }
        });
    });
}
refreshSectionCheckmarks();

// the actual work of writing the command to download the checked videos
function buildDownloadCommand(sectionIndex, sectionName, videoIndex, baseName, downloadLink, extension) {
    var cookieHeader = ' --header \"Cookie:' + document.cookie + '\" ';

    var directory = (sectionIndex + 1) + '. ' + sectionName + '/';
    var filename = directory + (videoIndex + 1) + '. ' + baseName + '.' + extension;

    var cmd = 'echo "' + filename + '" && ';
    cmd += 'mkdir -p "' + directory + '" && ';
    cmd += 'curl -L -C - ' + cookieHeader + " " + '"' + downloadLink + '" -o "' + filename + '"';
    return cmd;
}

function buildCommand(){
    var command = "";
    $("h3.list_header").each(function(sectionIndex){
        var sectionName = $(this).text().replace(/Chapter .+ - /,"").replace(/\:/,'-').replace(/^(V|I|X)+\. /,'');
        $(this).parent().next().find("a.lecture-link").each(function(videoIndex){
            var $lectureLink = $(this);
            // remove clip length from base name...
            var baseName = $.trim($lectureLink.text()).replace(/ \([0-9]*:[0-9]*\)/,"");

            // TODO: here should be a more complex way of finding the links. It should also be possible to download SRT, PDF, ...
            // TODO: what has been seen cannot be unseen!

            var links = $lectureLink.parent().find(".item_resource").find("a");

            if($(this).find(".multidownload").attr("checked"))

                for(var i = 0; i < links.length; i++) {
                    var $link = $(links[i]);
                    var downloadLink = $link.attr('href');

                    if(downloadLink.indexOf("txt") >= 0) {
                        extension = "txt";
                    } else if(downloadLink.indexOf("srt") >= 0) {
                        extension = "srt";
                    } else if(downloadLink.indexOf("pdf") >= 0) {
                        extension = "pdf";
                    } else if(downloadLink.indexOf("ppt") >= 0) {
                        extension = "ppt";
                    } else if(downloadLink.indexOf("pptx") >= 0) {
                        extension = "pptx";
                    } else if(downloadLink.indexOf("mp4") >= 0) {
                        extension = "mp4";
                    } else {
                        // TODO What to do with the drunken sailor? Add a error/log box
                        continue;
                    }

                    //var downloadLink = $(links[links.length - 1]).attr('href');
                    var cmd = buildDownloadCommand(sectionIndex, sectionName, videoIndex, baseName, downloadLink, extension);
                    command += cmd + "; ";
                }
        });
    });
    $("#cmd").val(command);
}

buildCommand();

// clicking a section checkbox
$(".multidownload_chapter").unbind();
$(".multidownload_chapter").click(function(e) {
    var check = $(this).attr("checked") ? true : false;
    $(this).parents(".list_header_link").next(".course-item-list-section-list").find(".multidownload").each(function(){
        $(this).prop("checked", check);
        console.log(check);
    });

    buildCommand();
    e.stopPropagation();
});

// clicking a video checkbox
$(".multidownload").unbind();
$(".multidownload").click(function(e) {
    buildCommand();
    refreshSectionCheckmarks();
    e.stopPropagation();
});
